import { chmod, copyFile } from "node:fs/promises";
import { $ } from "bun";

await $`bunx tsup`;
await copyFile("src/react/styles.css", "dist/styles.css");
await chmod("dist/cli.js", 0o755);
