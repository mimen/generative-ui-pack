import { createHash } from "node:crypto";
import type { Stats } from "node:fs";
import {
	lstat,
	mkdir,
	mkdtemp,
	readdir,
	readFile,
	realpath,
	rm,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, normalize, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import {
	compileOpenBotOverlayFiles,
	compileTarget,
	isSafePackRef,
	type JsonObject,
	OPENBOT_DEFAULT_PACK_REF,
	OPENBOT_OVERLAY_HOST_SHA,
	type OpenBotOverlayManifest,
	stableJson,
} from "../src/compiler/index";

interface CommandResult {
	readonly stdout: string;
	readonly stderr: string;
}

function optionValue(
	args: readonly string[],
	name: string,
): string | undefined {
	const index = args.indexOf(name);
	return index >= 0 ? args[index + 1] : undefined;
}

async function run(
	identity: string,
	command: readonly string[],
	cwd: string,
	forwardOutput = true,
): Promise<CommandResult> {
	const child = Bun.spawn(
		[
			"/bin/zsh",
			"-c",
			'identity="$1"; shift; exec -a "$identity" "$@"',
			"overlay-runner",
			identity,
			...command,
		],
		{ cwd, stdout: "pipe", stderr: "pipe" },
	);
	const [exitCode, stdout, stderr] = await Promise.all([
		child.exited,
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
	]);
	if (forwardOutput) {
		process.stdout.write(stdout);
		process.stderr.write(stderr);
	}
	if (exitCode !== 0) {
		throw new Error(`${command.join(" ")} failed with exit code ${exitCode}`);
	}
	return { stdout, stderr };
}

function sha256(content: string): string {
	return createHash("sha256").update(content).digest("hex");
}

function containedPath(root: string, relative: string): string {
	if (
		!relative ||
		relative.includes("\\") ||
		relative.includes("\0") ||
		isAbsolute(relative) ||
		normalize(relative) !== relative ||
		relative
			.split("/")
			.some(
				(segment) =>
					!segment || segment === "." || segment === ".." || segment === ".git",
			)
	) {
		throw new Error(`Unsafe compiled overlay path: ${relative}`);
	}
	const path = resolve(root, relative);
	if (path !== root && !path.startsWith(`${root}${sep}`)) {
		throw new Error(
			`Compiled overlay path escapes disposable checkout: ${relative}`,
		);
	}
	return path;
}

/**
 * The real directory a write will land in.
 *
 * `containedPath` is lexical, and `lstat` follows intermediate symlinks, so a symlinked parent
 * reports a clean regular file at the final component. Resolving the parent is what proves the
 * write stays inside the disposable checkout.
 */
async function containedParent(root: string, target: string): Promise<string> {
	const parent = await realpath(dirname(target));
	if (parent !== root && !parent.startsWith(`${root}${sep}`)) {
		throw new Error(
			`Overlay target parent escapes disposable checkout: ${target}`,
		);
	}
	return parent;
}

async function galleryNames(
	checkout: string,
	replacements: Readonly<Record<string, string>> = {},
): Promise<readonly string[]> {
	const root = await realpath(checkout);
	const directory = containedPath(root, "app/src/components/gallery");
	const directoryMetadata = await lstat(directory);
	if (directoryMetadata.isSymbolicLink() || !directoryMetadata.isDirectory()) {
		throw new Error("Disposable OpenBot gallery directory is unsafe");
	}
	const names: string[] = [];
	for (const file of (await readdir(directory))
		.filter((entry) => entry.endsWith(".tsx"))
		.sort()) {
		const relative = `app/src/components/gallery/${file}`;
		let content = replacements[relative];
		if (content === undefined) {
			const path = containedPath(root, relative);
			const metadata = await lstat(path);
			if (metadata.isSymbolicLink() || !metadata.isFile()) {
				throw new Error(`Disposable gallery module is unsafe: ${relative}`);
			}
			const actual = await realpath(path);
			if (!actual.startsWith(`${root}${sep}`)) {
				throw new Error(
					`Disposable gallery module escapes checkout: ${relative}`,
				);
			}
			content = await readFile(path, "utf8");
		}
		for (const match of content.matchAll(/^ {4}name: "([^"]+)"/gm)) {
			if (match[1]) names.push(match[1]);
		}
	}
	return names;
}

async function applyCompiledBundle(
	checkout: string,
	packRef: string,
): Promise<void> {
	const root = await realpath(checkout);
	const compiled = compileOpenBotOverlayFiles(packRef);
	const byPath = new Map(compiled.map((file) => [file.path, file.content]));
	const manifestContent = byPath.get("openbot/overlay-manifest.json");
	if (!manifestContent) throw new Error("Compiled overlay manifest is missing");
	const manifest = JSON.parse(manifestContent) as OpenBotOverlayManifest;
	const revision = await run(
		"generative-ui-pack:revision@openbot-overlay",
		["git", "rev-parse", "HEAD"],
		root,
		false,
	);
	if (revision.stdout.trim() !== manifest.hostCommit) {
		throw new Error(
			`Disposable OpenBot commit mismatch: ${revision.stdout.trim()}`,
		);
	}
	for (const guard of manifest.guards) {
		const path = containedPath(root, guard.path);
		const metadata = await lstat(path);
		if (metadata.isSymbolicLink() || !metadata.isFile()) {
			throw new Error(`Unsafe guarded OpenBot source: ${guard.path}`);
		}
		if (sha256(await readFile(path, "utf8")) !== guard.expectedSha256) {
			throw new Error(`Guarded OpenBot source drifted: ${guard.path}`);
		}
	}
	const before = await galleryNames(root);
	if (
		new Set(before).size !== before.length ||
		JSON.stringify([...before].sort()) !==
			JSON.stringify([...manifest.expectedNamesBefore].sort())
	) {
		throw new Error("Pre-overlay OpenBot names drifted");
	}
	const replacements: Record<string, string> = {};
	for (const patch of manifest.patches) {
		const output = byPath.get(`openbot/files/${patch.path}`);
		if (output === undefined || sha256(output) !== patch.outputSha256) {
			throw new Error(
				`Compiled overlay output is missing or corrupt: ${patch.path}`,
			);
		}
		replacements[patch.path] = output;
		const target = containedPath(root, patch.path);
		await containedParent(root, target);
		let metadata: Stats | undefined;
		try {
			metadata = await lstat(target);
		} catch {
			metadata = undefined;
		}
		if (metadata) {
			if (metadata.isSymbolicLink() || !metadata.isFile()) {
				throw new Error(`Unsafe overlay target: ${patch.path}`);
			}
			if (patch.expectedSha256 === null) {
				throw new Error(
					`Generated overlay target already exists: ${patch.path}`,
				);
			}
			if (sha256(await readFile(target, "utf8")) !== patch.expectedSha256) {
				throw new Error(`Overlay source hash mismatch: ${patch.path}`);
			}
		} else if (patch.expectedSha256 !== null) {
			throw new Error(`Required overlay source is missing: ${patch.path}`);
		}
	}
	const after = [
		...(await galleryNames(root, replacements)),
		...manifest.ownedNames,
	];
	if (
		new Set(after).size !== after.length ||
		JSON.stringify([...after].sort()) !==
			JSON.stringify([...manifest.expectedNamesAfter].sort())
	) {
		throw new Error("Post-overlay OpenBot names are not preserved and unique");
	}
	for (const patch of manifest.patches) {
		const target = containedPath(root, patch.path);
		await containedParent(root, target);
		const output = replacements[patch.path];
		if (output === undefined)
			throw new Error(`Missing validated output: ${patch.path}`);
		await writeFile(target, output, {
			encoding: "utf8",
			flag: patch.expectedSha256 === null ? "wx" : "w",
		});
	}
}

function expectedChangedPaths(packRef: string): readonly string[] {
	const manifestFile = compileOpenBotOverlayFiles(packRef).find(
		(file) => file.path === "openbot/overlay-manifest.json",
	);
	if (!manifestFile) throw new Error("Compiled overlay manifest is missing");
	const manifest = JSON.parse(manifestFile.content) as {
		patches: readonly { path: string }[];
	};
	return [...manifest.patches.map((patch) => patch.path), "bun.lock"].sort();
}

async function verifyChangedPaths(
	checkout: string,
	packRef: string,
): Promise<void> {
	const status = await run(
		"generative-ui-pack:git-status@openbot-overlay",
		["git", "status", "--porcelain", "--untracked-files=all"],
		checkout,
	);
	const actual = status.stdout
		.split("\n")
		.filter(Boolean)
		.map((line) => line.slice(3))
		.sort();
	const expected = expectedChangedPaths(packRef);
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error(
			`Overlay changed undeclared paths. Expected ${expected.join(", ")}; received ${actual.join(", ")}`,
		);
	}
}

async function verifyInstalledBindings(checkout: string): Promise<void> {
	const script = `import { z } from "zod";\nimport { OPENBOT_BINDINGS } from "@mimen/generative-ui-pack/openbot";\nconst bindings = OPENBOT_BINDINGS.map((binding) => ({\n  componentId: binding.componentId,\n  confirmation: binding.confirmation,\n  description: binding.description,\n  inputSchema: z.toJSONSchema(binding.inputSchema, { io: "input" }),\n  kind: binding.kind,\n  readOnly: binding.readOnly,\n  schemaId: binding.componentId + "@" + binding.viewVersion,\n  title: binding.title,\n  toolName: binding.toolName,\n  viewVersion: binding.viewVersion,\n}));\nprocess.stdout.write(JSON.stringify({ bindings, generatedFileFormatVersion: 1, target: "openbot" }));`;
	const observed = await run(
		"generative-ui-pack:schema-check@openbot-overlay",
		["bun", "-e", script],
		join(checkout, "app"),
		false,
	);
	const expectedFile = compileTarget("openbot").files.find(
		(file) => file.path === "openbot/bindings.json",
	);
	if (!expectedFile) throw new Error("OpenBot binding baseline is missing");
	const observedJson = JSON.parse(observed.stdout) as JsonObject;
	const expectedJson = JSON.parse(expectedFile.content) as JsonObject;
	if (stableJson(observedJson) !== stableJson(expectedJson)) {
		throw new Error(
			"Installed OpenBot bindings drift from the pinned JSON-schema baseline",
		);
	}

	const adapterUrl = pathToFileURL(
		join(checkout, "app/src/components/gallery/portable-pack.tsx"),
	).href;
	const galleryScript = `import { z } from "zod";\nimport { OPENBOT_CARD_GALLERY, OPENBOT_QUOTE_GALLERY } from ${JSON.stringify(adapterUrl)};\nconst specs = [...OPENBOT_CARD_GALLERY, ...OPENBOT_QUOTE_GALLERY];\nprocess.stdout.write(JSON.stringify(specs.map((spec) => ({ name: spec.name, inputSchema: z.toJSONSchema(spec.parameters, { io: "input" }) }))));`;
	const galleryOutput = await run(
		"generative-ui-pack:gallery-schema-check@openbot-overlay",
		["bun", "-e", galleryScript],
		join(checkout, "app"),
		false,
	);
	const gallerySpecs = JSON.parse(galleryOutput.stdout) as readonly {
		readonly name: string;
		readonly inputSchema: JsonObject;
	}[];
	const names = gallerySpecs.map((spec) => spec.name).sort();
	const expectedNames = [
		"showChecklist",
		"showMetrics",
		"showQuote",
		"showRecord",
	];
	if (
		new Set(names).size !== names.length ||
		JSON.stringify(names) !== JSON.stringify(expectedNames)
	) {
		throw new Error(
			`Generated OpenBot GALLERY names drifted: ${names.join(", ")}`,
		);
	}
	const expectedBindings = (
		expectedJson as {
			readonly bindings: readonly {
				readonly toolName: string;
				readonly inputSchema: JsonObject;
			}[];
		}
	).bindings;
	for (const spec of gallerySpecs) {
		const expected = expectedBindings.find(
			(binding) => binding.toolName === spec.name,
		);
		if (
			!expected ||
			stableJson(spec.inputSchema) !== stableJson(expected.inputSchema)
		) {
			throw new Error(`Generated OpenBot GALLERY schema drifted: ${spec.name}`);
		}
	}
}

async function captureEvidence(
	checkout: string,
	evidenceDirectory: string,
): Promise<void> {
	await mkdir(evidenceDirectory, { recursive: true });
	const adapterUrl = pathToFileURL(
		join(checkout, "app/src/components/gallery/portable-pack.tsx"),
	).href;
	const renderScript = `import { createElement } from "react";\nimport { renderToStaticMarkup } from "react-dom/server";\nimport { OPENBOT_CARD_GALLERY, OPENBOT_QUOTE_GALLERY } from ${JSON.stringify(adapterUrl)};\nconst components = [...OPENBOT_CARD_GALLERY, ...OPENBOT_QUOTE_GALLERY];\nconst streaming = [\n  [components[0], { fields: [{ label: "Amount" }] }],\n  [components[1], { metrics: [{ label: "Revenue" }] }],\n  [components[2], { items: [{ text: "Migrations" }] }],\n  [components[3], { quote: "Still streaming" }],\n];\nfor (const [spec, props] of streaming) renderToStaticMarkup(createElement(spec.Component, props));\nprocess.stdout.write(components.map((spec) => renderToStaticMarkup(createElement(spec.Component, spec.preview))).join(""));\n`;
	const rendered = await run(
		"generative-ui-pack:evidence-render@openbot-overlay",
		["bun", "-e", renderScript],
		join(checkout, "app"),
		false,
	);
	const css = await readFile(
		join(
			checkout,
			"app/node_modules/@mimen/generative-ui-pack/dist/styles.css",
		),
		"utf8",
	);
	const htmlPath = join(evidenceDirectory, "openbot-overlay-gallery.html");
	const screenshotPath = join(evidenceDirectory, "openbot-overlay-gallery.png");
	await writeFile(
		htmlPath,
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OpenBot overlay gallery</title><style>${css}\nbody{margin:0;background:#f2f4f7;color:#17202b;font-family:var(--gui-font-body)}main{width:min(72rem,calc(100% - 2rem));margin:3rem auto}h1{font-size:2rem;margin:0 0 .5rem}p{color:#5d6878;margin:0 0 2rem}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem;align-items:start}@media(max-width:48rem){.grid{grid-template-columns:1fr}}</style></head><body><main><h1>Stock OpenBot overlay</h1><p>Portable renderers through generated native GALLERY adapter glue.</p><section class="grid" aria-label="Portable OpenBot components">${rendered.stdout}</section></main></body></html>\n`,
		"utf8",
	);
	const browser = await chromium.launch({ channel: "chrome", headless: true });
	try {
		const page = await browser.newPage({
			viewport: { width: 1440, height: 900 },
		});
		await page.goto(pathToFileURL(htmlPath).href);
		await page.screenshot({ path: screenshotPath, fullPage: true });
	} finally {
		await browser.close();
	}
	process.stdout.write(
		`Evidence HTML ${htmlPath}\nEvidence screenshot ${screenshotPath}\n`,
	);
}

async function verifyOpenBotOverlay(
	evidenceDirectory: string,
	packRef: string,
): Promise<void> {
	const checkout = await mkdtemp(join(tmpdir(), "openbot-overlay-verify-"));
	try {
		await run(
			"generative-ui-pack:clone@openbot-overlay",
			[
				"git",
				"clone",
				"--quiet",
				"https://github.com/CopilotKit/openbot.git",
				checkout,
			],
			tmpdir(),
		);
		await run(
			"generative-ui-pack:branch@openbot-overlay",
			[
				"git",
				"switch",
				"--quiet",
				"-c",
				"verify/portable-overlay",
				OPENBOT_OVERLAY_HOST_SHA,
			],
			checkout,
		);
		await applyCompiledBundle(checkout, packRef);
		await run(
			"generative-ui-pack:install@openbot-overlay",
			["bun", "install"],
			checkout,
		);
		await verifyChangedPaths(checkout, packRef);
		await verifyInstalledBindings(checkout);
		await run(
			"generative-ui-pack:typecheck@openbot-overlay",
			["bun", "run", "typecheck"],
			checkout,
		);
		await run(
			"generative-ui-pack:format@openbot-overlay",
			["bun", "run", "format:check"],
			checkout,
		);
		await run(
			"generative-ui-pack:lint@openbot-overlay",
			["bun", "run", "lint"],
			checkout,
		);
		await run(
			"generative-ui-pack:test@openbot-overlay",
			["bun", "test", "app/tests"],
			checkout,
		);
		await run(
			"generative-ui-pack:build@openbot-overlay",
			["bun", "run", "build"],
			checkout,
			false,
		);
		process.stdout.write("OpenBot production build passed\n");
		await verifyChangedPaths(checkout, packRef);
		await captureEvidence(checkout, evidenceDirectory);
	} finally {
		await rm(checkout, { recursive: true, force: true });
	}
}

const evidenceDirectory = resolve(
	optionValue(process.argv, "--evidence-dir") ?? "evidence/openbot-overlay",
);
const packRef =
	optionValue(process.argv, "--pack-ref") ?? OPENBOT_DEFAULT_PACK_REF;
if (!isSafePackRef(packRef)) {
	process.stderr.write(`Unsafe --pack-ref: ${packRef}\n`);
	process.exit(1);
}
try {
	await verifyOpenBotOverlay(evidenceDirectory, packRef);
} catch (error) {
	const message =
		error instanceof Error
			? error.message
			: "OpenBot overlay verification failed";
	process.stderr.write(`${message}\n`);
	process.exitCode = 1;
}
