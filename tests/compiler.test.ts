import { describe, expect, test } from "bun:test";
import {
	COMPATIBILITY_MANIFEST,
	compileAllTargets,
	compileTarget,
	stableJson,
} from "../src/compiler/index";

describe("deterministic compiler contract", () => {
	test("emits byte-identical ordered files", () => {
		const first = compileTarget("openbot");
		const second = compileTarget("openbot");

		expect(first).toEqual(second);
		const paths = first.files.map((file) => file.path);
		expect(paths).toEqual([...paths].sort());
		expect(paths).toContain("compatibility-manifest.json");
		expect(paths).toContain("openbot/bindings.json");
		expect(paths).toContain("openbot/overlay-manifest.json");
		expect(first.files.every((file) => file.content.endsWith("\n"))).toBe(true);
	});

	test("records exact host commits and generated format version", () => {
		expect(COMPATIBILITY_MANIFEST.generatedFileFormatVersion).toBe(1);
		expect(COMPATIBILITY_MANIFEST.targets.openbot.commit).toBe(
			"6826e11afd52f03c30af2d873203792acad95f63",
		);
		expect(COMPATIBILITY_MANIFEST.targets.openbot.ref).toBe("refs/tags/v0.0.4");
		expect(COMPATIBILITY_MANIFEST.targets.openbot.sourceBlobs).toEqual({
			"app/src/components/gallery/cards.tsx":
				"ab4b6be182c45ee111ef7161a318cee2a1111895e5807772b195c79d761238b5",
			"app/src/components/gallery/quote.tsx":
				"7df5a48839b93127b47140290280927418561f879790ec1dc898c550c11aa2c1",
			"app/src/lib/copilot/gallery-registry.ts":
				"684664511012086bd1a18959bc7d93c7db9dc8d61a53d8f124f868beae92c608",
		});
		expect(COMPATIBILITY_MANIFEST.targets.openmaus.commit).toBe(
			"696ff1d5388342259379e1446b511ba82ae95afa",
		);
	});

	test("matches the checked-in OpenBot 6826e11 schema and metadata baseline", async () => {
		const emitted = compileTarget("openbot").files.find(
			(file) => file.path === "openbot/bindings.json",
		)?.content;
		const baseline = await Bun.file(
			"tests/fixtures/openbot-bindings-6826e11.json",
		).text();

		expect(JSON.parse(emitted ?? "")).toEqual(JSON.parse(baseline));
	});

	test("matches the checked-in OpenMaus 696ff1d native GallerySpec baseline", async () => {
		const emitted = compileTarget("openmaus").files.find(
			(file) => file.path === "openmaus/bindings.json",
		)?.content;
		const baseline = await Bun.file(
			"tests/fixtures/openmaus-bindings-696ff1d.json",
		).text();

		expect(JSON.parse(emitted ?? "")).toEqual(JSON.parse(baseline));
	});

	test("keeps tool names unique inside each target", () => {
		for (const result of compileAllTargets()) {
			const bindingsFile = result.files.find((file) =>
				file.path.endsWith("bindings.json"),
			);
			expect(bindingsFile).toBeDefined();
			const content = bindingsFile?.content ?? "";
			const toolNames = [...content.matchAll(/"toolName": "([^"]+)"/g)].map(
				(match) => match[1],
			);
			expect(new Set(toolNames).size).toBe(4);
		}
	});

	test("sorts keys by code point rather than process locale", () => {
		expect(stableJson({ ä: 1, z: 2, a: 3 })).toBe(
			'{\n  "a": 3,\n  "z": 2,\n  "ä": 1\n}\n',
		);
	});
});
