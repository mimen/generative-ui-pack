import { PACKAGE_VERSION } from "../core/version";
import type { CompatibilityManifest, JsonObject } from "./types";

export const COMPATIBILITY_MANIFEST = {
	packageVersion: PACKAGE_VERSION,
	generatedFileFormatVersion: 1,
	viewVersions: {
		record: 1,
		metrics: 1,
		checklist: 1,
		quote: 1,
	},
	targets: {
		openbot: {
			repository: "https://github.com/CopilotKit/openbot.git",
			commit: "6826e11afd52f03c30af2d873203792acad95f63",
			ref: "refs/tags/v0.0.4",
			contractVersion: 1,
			components: ["record", "metrics", "checklist", "quote"],
			sourceBlobs: {
				"app/src/components/gallery/cards.tsx":
					"ab4b6be182c45ee111ef7161a318cee2a1111895e5807772b195c79d761238b5",
				"app/src/components/gallery/quote.tsx":
					"7df5a48839b93127b47140290280927418561f879790ec1dc898c550c11aa2c1",
				"app/src/lib/copilot/gallery-registry.ts":
					"684664511012086bd1a18959bc7d93c7db9dc8d61a53d8f124f868beae92c608",
			},
		},
		openmaus: {
			repository: "https://github.com/mimen/OpenMausBot.git",
			commit: "696ff1d5388342259379e1446b511ba82ae95afa",
			contractVersion: 1,
			components: ["record", "metrics", "checklist", "quote"],
		},
	},
} as const satisfies CompatibilityManifest;

export function compatibilityManifestJson(): JsonObject {
	return {
		packageVersion: COMPATIBILITY_MANIFEST.packageVersion,
		generatedFileFormatVersion:
			COMPATIBILITY_MANIFEST.generatedFileFormatVersion,
		viewVersions: { ...COMPATIBILITY_MANIFEST.viewVersions },
		targets: {
			openbot: {
				...COMPATIBILITY_MANIFEST.targets.openbot,
				components: [...COMPATIBILITY_MANIFEST.targets.openbot.components],
			},
			openmaus: {
				...COMPATIBILITY_MANIFEST.targets.openmaus,
				components: [...COMPATIBILITY_MANIFEST.targets.openmaus.components],
			},
		},
	};
}
