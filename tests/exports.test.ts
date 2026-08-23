import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";

const SUBPATHS = ["core", "react", "compiler", "openbot", "openmaus"] as const;

describe("package exports", () => {
	test("builds JavaScript and declarations for every public subpath", async () => {
		for (const subpath of SUBPATHS) {
			expect(await Bun.file(`dist/${subpath}.js`).exists()).toBe(true);
			expect(await Bun.file(`dist/${subpath}.d.ts`).exists()).toBe(true);
		}
		expect(await Bun.file("dist/styles.css").exists()).toBe(true);
	});

	test("imports every JavaScript subpath through the package export map", async () => {
		const script = SUBPATHS.map(
			(subpath) => `await import("@mimen/generative-ui-pack/${subpath}");`,
		).join("\n");
		const child = Bun.spawn(["bun", "-e", script], {
			cwd: resolve(import.meta.dir, ".."),
			stdout: "pipe",
			stderr: "pipe",
		});
		const exitCode = await child.exited;
		const stderr = await new Response(child.stderr).text();

		expect(stderr).toBe("");
		expect(exitCode).toBe(0);
	});

	test("exports compiled CSS without host build-tool scanning", async () => {
		const packageText = await Bun.file("package.json").text();
		expect(packageText).toContain('"./styles.css": "./dist/styles.css"');
		const css = await Bun.file("dist/styles.css").text();
		expect(css).toContain(":where(:root)");
		expect(css).toContain("--gui-color-surface");
	});
});
