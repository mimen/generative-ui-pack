import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
	compileOpenBotOverlayFiles,
	OPENBOT_OVERLAY_CANDIDATE_SHA,
	OPENBOT_OVERLAY_HOST_SHA,
	OPENBOT_PACKAGE_SPEC,
	type OpenBotOverlayManifest,
	validateOverlayManifest,
} from "../src/compiler/index";

function compiledFiles(): ReadonlyMap<string, string> {
	return new Map(
		compileOpenBotOverlayFiles().map((file) => [file.path, file.content]),
	);
}

describe("stock OpenBot overlay compiler", () => {
	test("emits deterministic declared overlay files", () => {
		expect(compileOpenBotOverlayFiles()).toEqual(compileOpenBotOverlayFiles());
		expect([...compiledFiles().keys()]).toEqual([
			"openbot/files/app/package.json",
			"openbot/files/app/src/components/gallery/cards.tsx",
			"openbot/files/app/src/components/gallery/portable-pack.tsx",
			"openbot/files/app/src/components/gallery/quote.tsx",
			"openbot/files/app/src/main.tsx",
			"openbot/files/bun.lock",
			"openbot/overlay-manifest.json",
			"openbot/package-dependency.json",
			"openbot/source-patches.json",
		]);
	});

	test("pins the exact public host and candidate package commits", () => {
		const files = compiledFiles();
		const manifest = JSON.parse(
			files.get("openbot/overlay-manifest.json") ?? "",
		) as OpenBotOverlayManifest;
		expect(manifest.hostCommit).toBe(OPENBOT_OVERLAY_HOST_SHA);
		expect(manifest.packageCommit).toBe(OPENBOT_OVERLAY_CANDIDATE_SHA);
		expect(manifest.packageSpec).toBe(OPENBOT_PACKAGE_SPEC);
		expect(manifest.guards).toContainEqual({
			path: "app/src/lib/copilot/gallery-registry.ts",
			expectedSha256:
				"684664511012086bd1a18959bc7d93c7db9dc8d61a53d8f124f868beae92c608",
		});
		const packageJson = JSON.parse(
			files.get("openbot/files/app/package.json") ?? "",
		) as { dependencies: Record<string, string> };
		expect(packageJson.dependencies["@mimen/generative-ui-pack"]).toBe(
			OPENBOT_PACKAGE_SPEC,
		);
		expect(
			manifest.patches.find((patch) => patch.path === "app/package.json")
				?.ranges,
		).toEqual([{ label: "diff-1", startLine: 38, endLine: 39 }]);
		expect(files.get("openbot/files/bun.lock")).toContain(
			OPENBOT_OVERLAY_CANDIDATE_SHA,
		);
	});

	test("generates native adapter glue without copying renderer implementations", () => {
		const files = compiledFiles();
		const adapter =
			files.get("openbot/files/app/src/components/gallery/portable-pack.tsx") ??
			"";
		expect(adapter).toContain('from "@mimen/generative-ui-pack/react"');
		for (const renderer of ["Checklist", "Metrics", "Quote", "Record"]) {
			expect(adapter).toContain(renderer);
		}
		expect(adapter).toContain('from "@mimen/generative-ui-pack/openbot"');
		expect(adapter).not.toContain("function Record(");
		expect(adapter).not.toContain("function Metrics(");
		expect(adapter).not.toContain("function Checklist(");
		expect(adapter).not.toContain("function Quote(");
		expect(
			adapter.match(/Stream(?:Record|Metrics|Checklist|Quote)\.parse\(props\)/g)
				?.length,
		).toBe(4);
		expect(adapter).toContain('label: field.label ?? ""');
		expect(adapter).toContain('value: metric.value ?? ""');
		expect(adapter).toContain("done: item.done ?? false");
	});

	test("preserves showNotice and every pre-overlay name exactly once", () => {
		const files = compiledFiles();
		const manifest = JSON.parse(
			files.get("openbot/overlay-manifest.json") ?? "",
		) as OpenBotOverlayManifest;
		expect(manifest.expectedNamesBefore).toEqual(manifest.expectedNamesAfter);
		expect(manifest.expectedNamesAfter).toEqual([
			"askApproval",
			"askChoice",
			"showActivityReport",
			"showAreaChart",
			"showBarChart",
			"showChecklist",
			"showLineChart",
			"showMetrics",
			"showNotice",
			"showPieChart",
			"showProgress",
			"showQuote",
			"showRecord",
		]);
		const cards =
			files.get("openbot/files/app/src/components/gallery/cards.tsx") ?? "";
		expect(cards.match(/name: "showNotice"/g)?.length).toBe(1);
		expect(cards).toContain("...OPENBOT_CARD_GALLERY");
		expect(cards).not.toContain("export function RecordCard");
		const quote =
			files.get("openbot/files/app/src/components/gallery/quote.tsx") ?? "";
		expect(quote).toContain(
			'export { OPENBOT_QUOTE_GALLERY as GALLERY } from "./portable-pack"',
		);
	});

	test("imports compiled CSS before host styles", () => {
		const main = compiledFiles().get("openbot/files/app/src/main.tsx") ?? "";
		expect(main.indexOf("@mimen/generative-ui-pack/styles.css")).toBeLessThan(
			main.indexOf("./styles.css"),
		);
	});

	test("rejects undeclared or invalid patch ranges", () => {
		const files = compiledFiles();
		const manifest = JSON.parse(
			files.get("openbot/overlay-manifest.json") ?? "",
		) as OpenBotOverlayManifest;
		const outputs: Record<string, string> = {};
		for (const [path, content] of files) {
			const prefix = "openbot/files/";
			if (path.startsWith(prefix)) outputs[path.slice(prefix.length)] = content;
		}
		const invalid = {
			...manifest,
			patches: manifest.patches.map((patch, index) =>
				index === 0
					? {
							...patch,
							ranges: [
								{ label: "outside-source", startLine: 1, endLine: 99_999 },
							],
						}
					: patch,
			),
		} satisfies OpenBotOverlayManifest;
		expect(() => validateOverlayManifest(invalid, outputs)).toThrow(
			"Invalid overlay range",
		);
	});

	test("exports no arbitrary-checkout apply or recovery API", async () => {
		const compiler = await import("../src/compiler/index");
		expect("applyOpenBotOverlay" in compiler).toBe(false);
		expect("recoverOverlayTransaction" in compiler).toBe(false);
		expect("runOverlayTransaction" in compiler).toBe(false);
	});

	test("rejects output changes outside the declared source ranges", () => {
		const files = compiledFiles();
		const manifest = JSON.parse(
			files.get("openbot/overlay-manifest.json") ?? "",
		) as OpenBotOverlayManifest;
		const outputs: Record<string, string> = {};
		for (const [path, content] of files) {
			const prefix = "openbot/files/";
			if (path.startsWith(prefix)) outputs[path.slice(prefix.length)] = content;
		}
		const path = "app/package.json";
		const tampered = (outputs[path] ?? "").replace(
			'"name": "app"',
			'"name": "tampered"',
		);
		outputs[path] = tampered;
		const invalid = {
			...manifest,
			patches: manifest.patches.map((patch) =>
				patch.path === path
					? {
							...patch,
							outputSha256: createHash("sha256").update(tampered).digest("hex"),
						}
					: patch,
			),
		} satisfies OpenBotOverlayManifest;
		expect(() => validateOverlayManifest(invalid, outputs)).toThrow(
			"Overlay ranges do not equal actual diff",
		);
	});
});
