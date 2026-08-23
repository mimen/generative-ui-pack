import { C as ComponentId, V as ViewVersion } from './types-oGaoYaPx.js';

type HostTarget = "openbot" | "openmaus";
type HostKind = "card" | "list" | "action";
interface HostBindingMetadata {
    readonly componentId: ComponentId;
    readonly viewVersion: ViewVersion;
    readonly toolName: string;
    readonly kind: HostKind;
    readonly title: string;
    readonly description: string;
    readonly readOnly: true;
}
interface SerializableHostBinding extends HostBindingMetadata {
    readonly schemaId: string;
}
declare function toSerializableHostBinding(binding: HostBindingMetadata): SerializableHostBinding;

export { type HostTarget as H, type SerializableHostBinding as S, type HostBindingMetadata as a, type HostKind as b, toSerializableHostBinding as t };
