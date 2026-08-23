import { createHash } from "node:crypto";
import baselinePackage from "./openbot-baseline/app-package.json.txt";
import candidateLock from "./openbot-baseline/bun.lock.candidate.txt";
import baselineLock from "./openbot-baseline/bun.lock.txt";
import baselineCards from "./openbot-baseline/cards.tsx.txt";
import baselineRegistry from "./openbot-baseline/gallery-registry.ts.txt";
import baselineMain from "./openbot-baseline/main.tsx.txt";
import candidateAdapter from "./openbot-baseline/portable-pack.candidate.tsx.txt";
import baselineQuote from "./openbot-baseline/quote.tsx.txt";
import { stableJson } from "./stable-json";
import type { CompiledFile, JsonObject } from "./types";

export const OPENBOT_OVERLAY_CANDIDATE_SHA =
	"4998ef1e5080418b30f890e24e0c573d31649cde" as const;
export const OPENBOT_OVERLAY_HOST_SHA =
	"6826e11afd52f03c30af2d873203792acad95f63" as const;
export const OPENBOT_PACKAGE_SPEC =
	`github:mimen/generative-ui-pack#${OPENBOT_OVERLAY_CANDIDATE_SHA}` as const;

const OWNED_NAMES = [
	"showRecord",
	"showMetrics",
	"showChecklist",
	"showQuote",
] as const;
const RETAINED_NAMES = [
	"askApproval",
	"askChoice",
	"showActivityReport",
	"showAreaChart",
	"showBarChart",
	"showLineChart",
	"showNotice",
	"showPieChart",
	"showProgress",
] as const;

const ALL_BASELINE_NAMES = [...OWNED_NAMES, ...RETAINED_NAMES].sort();

const BASELINE_BY_PATH: Readonly<Record<string, string>> = {
	"app/package.json": baselinePackage,
	"bun.lock": baselineLock,
	"app/src/main.tsx": baselineMain,
	"app/src/components/gallery/cards.tsx": baselineCards,
	"app/src/components/gallery/quote.tsx": baselineQuote,
};

interface ReplacementRange {
	readonly label: string;
	readonly startLine: number;
	readonly endLine: number;
}

interface OverlayPatch {
	readonly path: string;
	readonly expectedSha256: string | null;
	readonly outputSha256: string;
	readonly ranges: readonly ReplacementRange[];
	readonly generated: boolean;
}

export interface OpenBotOverlayManifest {
	readonly formatVersion: 1;
	readonly target: "openbot";
	readonly hostCommit: typeof OPENBOT_OVERLAY_HOST_SHA;
	readonly packageCommit: typeof OPENBOT_OVERLAY_CANDIDATE_SHA;
	readonly packageSpec: typeof OPENBOT_PACKAGE_SPEC;
	readonly ownedNames: typeof OWNED_NAMES;
	readonly retainedNames: typeof RETAINED_NAMES;
	readonly expectedNamesBefore: readonly string[];
	readonly expectedNamesAfter: readonly string[];
	readonly guards: readonly {
		readonly path: string;
		readonly expectedSha256: string;
	}[];
	readonly patches: readonly OverlayPatch[];
}

function sha256(content: string): string {
	return createHash("sha256").update(content).digest("hex");
}

function jsonObject(value: object): JsonObject {
	// SAFETY: overlay manifests contain only literal JSON-compatible values.
	return JSON.parse(JSON.stringify(value)) as JsonObject;
}

function lineCount(content: string): number {
	return content.split("\n").length;
}

function replaceOnce(
	source: string,
	needle: string,
	replacement: string,
): string {
	const index = source.indexOf(needle);
	if (index < 0 || source.indexOf(needle, index + needle.length) >= 0) {
		throw new Error(`Expected one overlay anchor: ${needle}`);
	}
	return `${source.slice(0, index)}${replacement}${source.slice(index + needle.length)}`;
}

function packageOutput(): string {
	const parsed = JSON.parse(baselinePackage) as {
		dependencies: Record<string, string>;
	};
	parsed.dependencies["@mimen/generative-ui-pack"] = OPENBOT_PACKAGE_SPEC;
	return `${JSON.stringify(parsed, null, 2)}\n`;
}

function mainOutput(): string {
	return replaceOnce(
		baselineMain,
		'import "./styles.css";',
		'import "@mimen/generative-ui-pack/styles.css";\nimport "./styles.css";',
	);
}

function adapterOutput(): string {
	return candidateAdapter;
}

function cardsOutput(): string {
	const ownedStart = baselineCards.indexOf("export const RecordCardProps");
	const noticeStart = baselineCards.indexOf("export const NoticeCardProps");
	const galleryStart = baselineCards.indexOf(
		"export const GALLERY: GalleryComponent[] = [",
	);
	const noticeObjectStart = baselineCards.indexOf(
		'  {\n    name: "showNotice"',
		galleryStart,
	);
	const galleryEnd = baselineCards.lastIndexOf("];\n");
	if (
		ownedStart < 0 ||
		noticeStart < 0 ||
		galleryStart < 0 ||
		noticeObjectStart < 0 ||
		galleryEnd < 0
	) {
		throw new Error("Pinned cards.tsx anchors no longer match");
	}
	const importsAndTone = baselineCards.slice(0, ownedStart);
	const noticeDefinition = baselineCards.slice(noticeStart, galleryStart);
	const noticeObject = baselineCards.slice(noticeObjectStart, galleryEnd);
	const withPortableImport = replaceOnce(
		importsAndTone,
		'import { Badge, GalleryFrame, type Tone } from "./frame";',
		'import { Badge, GalleryFrame } from "./frame";\nimport { OPENBOT_CARD_GALLERY } from "./portable-pack";',
	);
	return `${withPortableImport}${noticeDefinition}export const GALLERY: GalleryComponent[] = [\n  ...OPENBOT_CARD_GALLERY,\n${noticeObject}];\n`;
}

function quoteOutput(): string {
	return `// Generated by @mimen/generative-ui-pack. Do not edit.\nexport { OPENBOT_QUOTE_GALLERY as GALLERY } from "./portable-pack";\n`;
}

function galleryNames(source: string): readonly string[] {
	return [...source.matchAll(/name:\s*"([^"]+)"/g)]
		.map((match) => match[1])
		.filter((name): name is string => name !== undefined);
}

function replacementRanges(
	path: string,
	output: string,
): readonly ReplacementRange[] {
	const baseline = BASELINE_BY_PATH[path];
	if (baseline === undefined) {
		return [
			{
				label: "generated",
				startLine: 1,
				endLine: lineCount(output),
			},
		];
	}
	const changed = [...changedBaselineLines(baseline, output)].sort(
		(left, right) => left - right,
	);
	const ranges: ReplacementRange[] = [];
	for (const line of changed) {
		const previous = ranges.at(-1);
		if (previous && line === previous.endLine + 1) {
			ranges[ranges.length - 1] = { ...previous, endLine: line };
		} else {
			ranges.push({
				label: `diff-${ranges.length + 1}`,
				startLine: line,
				endLine: line,
			});
		}
	}
	return ranges;
}

function buildOverlay(): {
	readonly manifest: OpenBotOverlayManifest;
	readonly outputs: Readonly<Record<string, string>>;
} {
	const outputs = {
		"app/package.json": packageOutput(),
		"bun.lock": candidateLock,
		"app/src/main.tsx": mainOutput(),
		"app/src/components/gallery/cards.tsx": cardsOutput(),
		"app/src/components/gallery/quote.tsx": quoteOutput(),
		"app/src/components/gallery/portable-pack.tsx": adapterOutput(),
	} as const;
	const localOwnedNames = [
		...galleryNames(baselineCards),
		...galleryNames(baselineQuote),
	].sort();
	if (
		JSON.stringify(localOwnedNames) !==
		JSON.stringify([...OWNED_NAMES, "showNotice"].sort())
	) {
		throw new Error("Pinned owned gallery names no longer match");
	}
	const expectedNamesBefore = [...ALL_BASELINE_NAMES];
	const expectedNamesAfter = [...ALL_BASELINE_NAMES];
	const patches: OverlayPatch[] = [
		{
			path: "app/package.json",
			expectedSha256: sha256(baselinePackage),
			outputSha256: sha256(outputs["app/package.json"]),
			ranges: replacementRanges(
				"app/package.json",
				outputs["app/package.json"],
			),
			generated: false,
		},
		{
			path: "bun.lock",
			expectedSha256: sha256(baselineLock),
			outputSha256: sha256(outputs["bun.lock"]),
			ranges: replacementRanges("bun.lock", outputs["bun.lock"]),
			generated: false,
		},
		{
			path: "app/src/main.tsx",
			expectedSha256: sha256(baselineMain),
			outputSha256: sha256(outputs["app/src/main.tsx"]),
			ranges: replacementRanges(
				"app/src/main.tsx",
				outputs["app/src/main.tsx"],
			),
			generated: false,
		},
		{
			path: "app/src/components/gallery/cards.tsx",
			expectedSha256: sha256(baselineCards),
			outputSha256: sha256(outputs["app/src/components/gallery/cards.tsx"]),
			ranges: replacementRanges(
				"app/src/components/gallery/cards.tsx",
				outputs["app/src/components/gallery/cards.tsx"],
			),
			generated: false,
		},
		{
			path: "app/src/components/gallery/quote.tsx",
			expectedSha256: sha256(baselineQuote),
			outputSha256: sha256(outputs["app/src/components/gallery/quote.tsx"]),
			ranges: replacementRanges(
				"app/src/components/gallery/quote.tsx",
				outputs["app/src/components/gallery/quote.tsx"],
			),
			generated: false,
		},
		{
			path: "app/src/components/gallery/portable-pack.tsx",
			expectedSha256: null,
			outputSha256: sha256(
				outputs["app/src/components/gallery/portable-pack.tsx"],
			),
			ranges: replacementRanges(
				"app/src/components/gallery/portable-pack.tsx",
				outputs["app/src/components/gallery/portable-pack.tsx"],
			),
			generated: true,
		},
	];
	const manifest: OpenBotOverlayManifest = {
		formatVersion: 1,
		target: "openbot",
		hostCommit: OPENBOT_OVERLAY_HOST_SHA,
		packageCommit: OPENBOT_OVERLAY_CANDIDATE_SHA,
		packageSpec: OPENBOT_PACKAGE_SPEC,
		ownedNames: OWNED_NAMES,
		retainedNames: RETAINED_NAMES,
		expectedNamesBefore: [...expectedNamesBefore].sort(),
		expectedNamesAfter,
		guards: [
			{
				path: "app/src/lib/copilot/gallery-registry.ts",
				expectedSha256: sha256(baselineRegistry),
			},
			{
				path: "app/src/components/gallery/activity.tsx",
				expectedSha256:
					"443ba030aba99700437989bb19c907d066919e03699d5700571b90d0cdbc60d9",
			},
			{
				path: "app/src/components/gallery/charts.tsx",
				expectedSha256:
					"673b59694b754f0c03d3c4ed41cc1fc7eb6d7b16a26023f8acfc8c04cbc02f70",
			},
			{
				path: "app/src/components/gallery/decisions.tsx",
				expectedSha256:
					"cc762a549667b1ee05bb0381c43b67b5e00fa7b1e2c37eedc389bb93dd20bd19",
			},
			{
				path: "app/src/components/gallery/frame.tsx",
				expectedSha256:
					"86bba59a0792f88ce087ff6da6d8f8abe5c5294f7d6723b4acff013630a49f2e",
			},
			{
				path: "app/src/components/gallery/preview.tsx",
				expectedSha256:
					"c620c7c52820abf5a7caa3227c13b72e6ed484f3f94a10264f4f92ed351205af",
			},
			{
				path: "app/src/components/gallery/refused.tsx",
				expectedSha256:
					"17ea998c07dc59c3daedf77fd68dbe4161553d4482251cce7a7c7854aca83eea",
			},
		],
		patches,
	};
	validateOverlayManifest(manifest, outputs);
	return { manifest, outputs };
}

function changedBaselineLines(
	before: string,
	after: string,
): ReadonlySet<number> {
	const left = before.split("\n");
	const right = after.split("\n");
	const width = right.length + 1;
	const lengths = new Uint32Array((left.length + 1) * width);
	for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
		for (let rightIndex = right.length - 1; rightIndex >= 0; rightIndex -= 1) {
			const offset = leftIndex * width + rightIndex;
			lengths[offset] =
				left[leftIndex] === right[rightIndex]
					? 1 + (lengths[(leftIndex + 1) * width + rightIndex + 1] ?? 0)
					: Math.max(
							lengths[(leftIndex + 1) * width + rightIndex] ?? 0,
							lengths[leftIndex * width + rightIndex + 1] ?? 0,
						);
		}
	}
	const changed = new Set<number>();
	let leftIndex = 0;
	let rightIndex = 0;
	while (leftIndex < left.length || rightIndex < right.length) {
		if (
			leftIndex < left.length &&
			rightIndex < right.length &&
			left[leftIndex] === right[rightIndex]
		) {
			leftIndex += 1;
			rightIndex += 1;
			continue;
		}
		const deletionScore =
			leftIndex < left.length
				? (lengths[(leftIndex + 1) * width + rightIndex] ?? 0)
				: -1;
		const insertionScore =
			rightIndex < right.length
				? (lengths[leftIndex * width + rightIndex + 1] ?? 0)
				: -1;
		if (leftIndex < left.length && deletionScore >= insertionScore) {
			changed.add(leftIndex + 1);
			leftIndex += 1;
		} else if (rightIndex < right.length) {
			changed.add(Math.min(left.length, leftIndex + 1));
			rightIndex += 1;
		}
	}
	return changed;
}

export function validateOverlayManifest(
	manifest: OpenBotOverlayManifest,
	outputs: Readonly<Record<string, string>>,
): void {
	const outputPaths = Object.keys(outputs).sort();
	const patchPaths = manifest.patches.map((patch) => patch.path).sort();
	if (new Set(patchPaths).size !== patchPaths.length) {
		throw new Error("Overlay patch paths must be unique");
	}
	if (JSON.stringify(outputPaths) !== JSON.stringify(patchPaths)) {
		throw new Error("Overlay outputs must exactly match declared patch paths");
	}
	for (const patch of manifest.patches) {
		const output = outputs[patch.path];
		if (output === undefined || sha256(output) !== patch.outputSha256) {
			throw new Error(`Overlay output hash mismatch for ${patch.path}`);
		}
		const rangeBoundary = lineCount(BASELINE_BY_PATH[patch.path] ?? output);
		for (const range of patch.ranges) {
			if (
				range.startLine < 1 ||
				range.endLine < range.startLine ||
				range.endLine > rangeBoundary
			) {
				throw new Error(
					`Invalid overlay range for ${patch.path}: ${range.label}`,
				);
			}
		}
		const expectedRanges = replacementRanges(patch.path, output);
		if (JSON.stringify(patch.ranges) !== JSON.stringify(expectedRanges)) {
			throw new Error(
				`Overlay ranges do not equal actual diff for ${patch.path}`,
			);
		}
	}
	const beforeNames = manifest.expectedNamesBefore;
	const names = manifest.expectedNamesAfter;
	if (new Set(beforeNames).size !== beforeNames.length) {
		throw new Error("Pre-overlay component names must be unique");
	}
	if (new Set(names).size !== names.length) {
		throw new Error("Post-overlay component names must be unique");
	}
	for (const previousName of beforeNames) {
		if (!names.includes(previousName)) {
			throw new Error(`Pre-overlay component name was lost: ${previousName}`);
		}
	}
	for (const retained of manifest.retainedNames) {
		if (
			!manifest.expectedNamesBefore.includes(retained) ||
			!names.includes(retained)
		) {
			throw new Error(`Retained OpenBot name is not preserved: ${retained}`);
		}
	}
}

export function compileOpenBotOverlayFiles(): readonly CompiledFile[] {
	const { manifest, outputs } = buildOverlay();
	const files: CompiledFile[] = [
		{
			path: "openbot/overlay-manifest.json",
			content: stableJson(jsonObject(manifest)),
		},
		{
			path: "openbot/source-patches.json",
			content: stableJson(
				jsonObject({
					formatVersion: 1,
					patches: manifest.patches.filter((patch) => !patch.generated),
					generatedFiles: manifest.patches.filter((patch) => patch.generated),
				}),
			),
		},
		{
			path: "openbot/package-dependency.json",
			content: stableJson(
				jsonObject({
					name: "@mimen/generative-ui-pack",
					spec: OPENBOT_PACKAGE_SPEC,
					commit: OPENBOT_OVERLAY_CANDIDATE_SHA,
				}),
			),
		},
	];
	for (const [path, content] of Object.entries(outputs)) {
		files.push({ path: `openbot/files/${path}`, content });
	}
	return files.sort((left, right) => {
		if (left.path === right.path) return 0;
		return left.path < right.path ? -1 : 1;
	});
}

export const OPENBOT_BASELINE_REGISTRY_SHA256 = sha256(baselineRegistry);
