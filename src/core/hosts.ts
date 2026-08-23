import type { ComponentId, ViewVersion } from "./types";

export type HostTarget = "openbot" | "openmaus";
export type HostKind = "card" | "list" | "action";

export interface HostBindingMetadata {
	readonly componentId: ComponentId;
	readonly viewVersion: ViewVersion;
	readonly toolName: string;
	readonly kind: HostKind;
	readonly title: string;
	readonly description: string;
	readonly readOnly: true;
}

export interface SerializableHostBinding extends HostBindingMetadata {
	readonly schemaId: string;
}

export function toSerializableHostBinding(
	binding: HostBindingMetadata,
): SerializableHostBinding {
	return {
		componentId: binding.componentId,
		viewVersion: binding.viewVersion,
		toolName: binding.toolName,
		kind: binding.kind,
		title: binding.title,
		description: binding.description,
		readOnly: binding.readOnly,
		schemaId: `${binding.componentId}@${binding.viewVersion}`,
	};
}
