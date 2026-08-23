import { z } from "zod";
import {
	type HostBindingMetadata,
	type HostTarget,
	toSerializableHostBinding,
} from "../core/index";
import { OPENBOT_BINDINGS, type OpenBotBinding } from "../openbot/index";
import { OPENMAUS_BINDINGS, type OpenMausBinding } from "../openmaus/index";
import { COMPATIBILITY_MANIFEST, compatibilityManifestJson } from "./manifest";
import { compileOpenBotOverlayFiles } from "./openbot-overlay";
import { stableJson } from "./stable-json";
import type { CompileResult, JsonObject, JsonValue } from "./types";

function genericBindingJson(binding: HostBindingMetadata): JsonObject {
	const serializable = toSerializableHostBinding(binding);
	return {
		componentId: serializable.componentId,
		viewVersion: serializable.viewVersion,
		toolName: serializable.toolName,
		kind: serializable.kind,
		title: serializable.title,
		description: serializable.description,
		readOnly: serializable.readOnly,
		schemaId: serializable.schemaId,
	};
}

function jsonSchemaObject(schema: object): JsonObject {
	// SAFETY: Zod JSON Schema output is JSON-compatible; serialization removes prototype-only structure before narrowing.
	return JSON.parse(JSON.stringify(schema)) as JsonObject;
}

function openBotBindingJson(binding: OpenBotBinding): JsonObject {
	const inputSchema = jsonSchemaObject(
		z.toJSONSchema(binding.inputSchema, { io: "input" }),
	);
	return {
		...genericBindingJson(binding),
		confirmation: binding.confirmation,
		inputSchema,
	};
}

function openMausBindingJson(binding: OpenMausBinding): JsonObject {
	return {
		...genericBindingJson(binding),
		confirmation: binding.confirmation,
		parameters: binding.parameters,
		validationAdapter: binding.validationAdapter,
	};
}

function bindingsJson(target: HostTarget): JsonObject {
	const bindings: JsonValue[] =
		target === "openbot"
			? OPENBOT_BINDINGS.map((binding) => openBotBindingJson(binding))
			: OPENMAUS_BINDINGS.map((binding) => openMausBindingJson(binding));

	return {
		generatedFileFormatVersion:
			COMPATIBILITY_MANIFEST.generatedFileFormatVersion,
		target,
		bindings,
	};
}

export function compileTarget(target: HostTarget): CompileResult {
	const files = [
		{
			path: "compatibility-manifest.json",
			content: stableJson(compatibilityManifestJson()),
		},
		{
			path: `${target}/bindings.json`,
			content: stableJson(bindingsJson(target)),
		},
		...(target === "openbot" ? compileOpenBotOverlayFiles() : []),
	].sort((left, right) => {
		if (left.path === right.path) return 0;
		return left.path < right.path ? -1 : 1;
	});

	return { target, files };
}

export function compileAllTargets(): readonly CompileResult[] {
	return [compileTarget("openbot"), compileTarget("openmaus")];
}
