#!/usr/bin/env bun

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
	COMPATIBILITY_MANIFEST,
	compatibilityManifestJson,
	compileTarget,
	stableJson,
} from "./compiler/index";
import type { HostTarget } from "./core/index";

interface CompileOptions {
	readonly target: HostTarget;
	readonly outDir: string;
}

function optionValue(
	args: readonly string[],
	name: string,
): string | undefined {
	const index = args.indexOf(name);
	return index >= 0 ? args[index + 1] : undefined;
}

function parseTarget(value: string | undefined): HostTarget {
	if (value === "openbot" || value === "openmaus") {
		return value;
	}
	throw new Error("--target must be openbot or openmaus");
}

function parseCompileOptions(args: readonly string[]): CompileOptions {
	return {
		target: parseTarget(optionValue(args, "--target")),
		outDir: resolve(optionValue(args, "--out-dir") ?? "generated"),
	};
}

async function writeCompiledTarget(options: CompileOptions): Promise<void> {
	const result = compileTarget(options.target);
	for (const file of result.files) {
		const destination = resolve(options.outDir, file.path);
		await mkdir(dirname(destination), { recursive: true });
		await writeFile(destination, file.content, "utf8");
	}
}

function usage(): string {
	return [
		"generative-ui-pack manifest",
		"generative-ui-pack compile --target <openbot|openmaus> [--out-dir generated]",
	].join("\n");
}

export async function main(args: readonly string[]): Promise<number> {
	const command = args[0];
	if (command === "manifest") {
		process.stdout.write(stableJson(compatibilityManifestJson()));
		return 0;
	}

	if (command === "compile") {
		const options = parseCompileOptions(args.slice(1));
		await writeCompiledTarget(options);
		process.stdout.write(
			`Compiled ${options.target} format ${COMPATIBILITY_MANIFEST.generatedFileFormatVersion} to ${options.outDir}\n`,
		);
		return 0;
	}

	process.stderr.write(`${usage()}\n`);
	return 1;
}

if (import.meta.main) {
	try {
		process.exitCode = await main(process.argv.slice(2));
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Compilation failed";
		process.stderr.write(`${message}\n`);
		process.exitCode = 1;
	}
}
