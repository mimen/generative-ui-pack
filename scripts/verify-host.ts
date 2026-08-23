import {
	COMPATIBILITY_MANIFEST,
	verifyHostCheckout,
	verifyHostRemote,
} from "../src/compiler/index";
import type { HostTarget } from "../src/core/index";

function optionValue(
	args: readonly string[],
	name: string,
): string | undefined {
	const index = args.indexOf(name);
	return index >= 0 ? args[index + 1] : undefined;
}

function targetValue(value: string | undefined): HostTarget {
	if (value === "openbot" || value === "openmaus") return value;
	throw new Error("--target must be openbot or openmaus");
}

const target = targetValue(optionValue(process.argv, "--target"));
const checkout = optionValue(process.argv, "--checkout");
const remote = optionValue(process.argv, "--remote");
const compatibility = COMPATIBILITY_MANIFEST.targets[target];
const result = checkout
	? await verifyHostCheckout(compatibility, checkout)
	: await verifyHostRemote(compatibility, remote ?? compatibility.repository);

if (!result.ok) {
	process.stderr.write(`${result.error}\n`);
	process.exitCode = 1;
} else {
	process.stdout.write(
		`Verified ${target} ${result.evidence.commit} (${Object.keys(result.evidence.sourceBlobs).length} source blobs)\n`,
	);
}
