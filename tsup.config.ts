import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		core: "src/core/index.ts",
		react: "src/react/index.ts",
		compiler: "src/compiler/index.ts",
		openbot: "src/openbot/index.ts",
		openmaus: "src/openmaus/index.ts",
		cli: "src/cli.ts",
	},
	format: ["esm"],
	target: "es2022",
	platform: "neutral",
	dts: true,
	splitting: false,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom", "react/jsx-runtime", "zod"],
});
