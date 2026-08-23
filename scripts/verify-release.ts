import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { z } from "zod";
import {
	COMPATIBILITY_MANIFEST,
	verifyHostRemote,
} from "../src/compiler/index";

interface CommandResult {
	readonly stdout: string;
	readonly stderr: string;
}

const PackageSchema = z
	.object({
		name: z.string(),
		version: z.string(),
		scripts: z.record(z.string(), z.string()).optional(),
	})
	.passthrough();

function optionValue(
	args: readonly string[],
	name: string,
): string | undefined {
	const index = args.indexOf(name);
	return index >= 0 ? args[index + 1] : undefined;
}

async function run(
	command: readonly string[],
	cwd?: string,
): Promise<CommandResult> {
	const child = Bun.spawn([...command], {
		...(cwd ? { cwd } : {}),
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		child.exited,
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
	]);
	if (exitCode !== 0) {
		throw new Error(`${command.join(" ")} failed: ${stderr.trim()}`);
	}
	return { stdout: stdout.trim(), stderr: stderr.trim() };
}

function gitDependency(repository: string, tag: string): string {
	if (repository.startsWith("/") || repository.startsWith("file://")) {
		const url = repository.startsWith("file://")
			? repository
			: `file://${resolve(repository)}`;
		return `git+${url}#${tag}`;
	}
	if (/^(https?|git):\/\//.test(repository)) {
		return `git+${repository}#${tag}`;
	}
	return `${repository}#${tag}`;
}

export interface ReleaseVerificationOptions {
	readonly verifyHosts?: boolean | undefined;
}

export async function verifyRelease(
	repository: string,
	tag: string,
	options: ReleaseVerificationOptions = {},
): Promise<void> {
	const temporaryRoot = await mkdtemp(join(tmpdir(), "gui-pack-release-"));
	const checkout = join(temporaryRoot, "checkout");
	const archiveDirectory = join(temporaryRoot, "archive");
	const consumer = join(temporaryRoot, "consumer");
	try {
		await run(
			["git", "clone", "--quiet", "--branch", tag, repository, checkout],
			temporaryRoot,
		);
		const commit = (await run(["git", "rev-parse", "HEAD"], checkout)).stdout;
		const packageJson = PackageSchema.parse(
			JSON.parse(await readFile(join(checkout, "package.json"), "utf8")),
		);
		if (tag !== `v${packageJson.version}`) {
			throw new Error(
				`Tag/package mismatch: ${tag} does not identify version ${packageJson.version}`,
			);
		}
		for (const lifecycle of [
			"preinstall",
			"install",
			"postinstall",
			"prepare",
		]) {
			if (packageJson.scripts?.[lifecycle]) {
				throw new Error(`Release dependency must not run ${lifecycle}`);
			}
		}

		await mkdir(archiveDirectory, { recursive: true });
		const archive = join(archiveDirectory, "generative-ui-pack.tgz");
		await run(
			["bun", "pm", "pack", "--quiet", "--filename", archive],
			checkout,
		);
		const archiveList = (await run(["tar", "-tzf", archive], temporaryRoot))
			.stdout;
		for (const required of [
			"package/package.json",
			"package/LICENSE",
			"package/NOTICE",
			"package/dist/core.js",
			"package/dist/core.d.ts",
			"package/dist/react.js",
			"package/dist/react.d.ts",
			"package/dist/compiler.js",
			"package/dist/openbot.js",
			"package/dist/openmaus.js",
			"package/dist/cli.js",
			"package/dist/styles.css",
		]) {
			if (!archiveList.split("\n").includes(required)) {
				throw new Error(`Release archive is missing ${required}`);
			}
		}

		await mkdir(consumer, { recursive: true });
		await writeFile(
			join(consumer, "package.json"),
			`${JSON.stringify(
				{
					name: "clean-consumer",
					private: true,
					type: "module",
					dependencies: {
						[packageJson.name]: gitDependency(repository, tag),
					},
				},
				null,
				2,
			)}\n`,
			"utf8",
		);
		await run(["bun", "install"], consumer);
		const smoke = [
			'await import("@mimen/generative-ui-pack/core");',
			'await import("@mimen/generative-ui-pack/react");',
			'await import("@mimen/generative-ui-pack/compiler");',
			'await import("@mimen/generative-ui-pack/openbot");',
			'await import("@mimen/generative-ui-pack/openmaus");',
			'if (!(await Bun.file("node_modules/@mimen/generative-ui-pack/dist/styles.css").exists())) throw new Error("missing CSS");',
		].join("\n");
		await run(["bun", "-e", smoke], consumer);
		await run(
			["bun", "node_modules/.bin/generative-ui-pack", "manifest"],
			consumer,
		);

		if (options.verifyHosts !== false) {
			for (const [target, compatibility] of Object.entries(
				COMPATIBILITY_MANIFEST.targets,
			)) {
				const result = await verifyHostRemote(compatibility);
				if (!result.ok) throw new Error(`${target}: ${result.error}`);
			}
		}

		const hostLabel =
			options.verifyHosts === false ? "host checks skipped" : "host identities";
		process.stdout.write(
			`Verified ${tag} at ${commit}: archive, clean Git-ref consumer, exports, CSS, CLI, and ${hostLabel}\n`,
		);
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
}

if (import.meta.main) {
	const repository = optionValue(process.argv, "--repository");
	const tag = optionValue(process.argv, "--tag");
	if (!repository || !tag) {
		process.stderr.write(
			"Usage: bun run verify:release --repository <git-url-or-path> --tag <vX.Y.Z>\n",
		);
		process.exitCode = 1;
	} else {
		try {
			await verifyRelease(repository, tag);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Release verification failed";
			process.stderr.write(`${message}\n`);
			process.exitCode = 1;
		}
	}
}
