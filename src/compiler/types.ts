import type { ComponentId, HostTarget, ViewVersion } from "../core/index";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
export interface JsonObject {
	readonly [key: string]: JsonValue;
}

export interface HostCompatibility {
	readonly repository: string;
	readonly commit: string;
	readonly ref?: string | undefined;
	readonly contractVersion: 1;
	readonly components: readonly ComponentId[];
	readonly sourceBlobs?: Readonly<Record<string, string>> | undefined;
}

export interface CompatibilityManifest {
	readonly packageVersion: string;
	readonly generatedFileFormatVersion: 1;
	readonly viewVersions: Readonly<Record<ComponentId, ViewVersion>>;
	readonly targets: Readonly<Record<HostTarget, HostCompatibility>>;
}

export interface CompiledFile {
	readonly path: string;
	readonly content: string;
}

export interface CompileResult {
	readonly target: HostTarget;
	readonly files: readonly CompiledFile[];
}
