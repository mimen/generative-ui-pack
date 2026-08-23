import { H as HostTarget } from './hosts-D6FqS1QZ.js';
import { C as ComponentId, V as ViewVersion } from './types-oGaoYaPx.js';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
interface JsonObject {
    readonly [key: string]: JsonValue;
}
interface HostCompatibility {
    readonly repository: string;
    readonly commit: string;
    readonly ref?: string | undefined;
    readonly contractVersion: 1;
    readonly components: readonly ComponentId[];
    readonly sourceBlobs?: Readonly<Record<string, string>> | undefined;
}
interface CompatibilityManifest {
    readonly packageVersion: string;
    readonly generatedFileFormatVersion: 1;
    readonly viewVersions: Readonly<Record<ComponentId, ViewVersion>>;
    readonly targets: Readonly<Record<HostTarget, HostCompatibility>>;
}
interface CompiledFile {
    readonly path: string;
    readonly content: string;
}
interface CompileResult {
    readonly target: HostTarget;
    readonly files: readonly CompiledFile[];
}

declare function compileTarget(target: HostTarget): CompileResult;
declare function compileAllTargets(): readonly CompileResult[];

declare const COMPATIBILITY_MANIFEST: {
    readonly packageVersion: "0.1.0";
    readonly generatedFileFormatVersion: 1;
    readonly viewVersions: {
        readonly record: 1;
        readonly metrics: 1;
        readonly checklist: 1;
        readonly quote: 1;
    };
    readonly targets: {
        readonly openbot: {
            readonly repository: "https://github.com/CopilotKit/openbot.git";
            readonly commit: "6826e11afd52f03c30af2d873203792acad95f63";
            readonly ref: "refs/tags/v0.0.4";
            readonly contractVersion: 1;
            readonly components: readonly ["record", "metrics", "checklist", "quote"];
            readonly sourceBlobs: {
                readonly "app/src/components/gallery/cards.tsx": "ab4b6be182c45ee111ef7161a318cee2a1111895e5807772b195c79d761238b5";
                readonly "app/src/components/gallery/quote.tsx": "7df5a48839b93127b47140290280927418561f879790ec1dc898c550c11aa2c1";
                readonly "app/src/lib/copilot/gallery-registry.ts": "684664511012086bd1a18959bc7d93c7db9dc8d61a53d8f124f868beae92c608";
            };
        };
        readonly openmaus: {
            readonly repository: "https://github.com/mimen/OpenMausBot.git";
            readonly commit: "696ff1d5388342259379e1446b511ba82ae95afa";
            readonly contractVersion: 1;
            readonly components: readonly ["record", "metrics", "checklist", "quote"];
        };
    };
};
declare function compatibilityManifestJson(): JsonObject;

declare function stableJson(value: JsonValue): string;

interface HostVerificationEvidence {
    readonly commit: string;
    readonly sourceBlobs: Readonly<Record<string, string>>;
}
type HostVerificationResult = {
    readonly ok: true;
    readonly evidence: HostVerificationEvidence;
} | {
    readonly ok: false;
    readonly error: string;
};
declare function verifyHostCheckout(compatibility: HostCompatibility, checkout: string): Promise<HostVerificationResult>;
declare function verifyHostRemote(compatibility: HostCompatibility, remote?: string): Promise<HostVerificationResult>;

export { COMPATIBILITY_MANIFEST, type CompatibilityManifest, type CompileResult, type CompiledFile, type HostCompatibility, type HostVerificationEvidence, type HostVerificationResult, type JsonObject, type JsonPrimitive, type JsonValue, compatibilityManifestJson, compileAllTargets, compileTarget, stableJson, verifyHostCheckout, verifyHostRemote };
