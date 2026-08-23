import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, normalize, resolve, sep } from "node:path";
import type { HostCompatibility } from "./types";

export interface HostVerificationEvidence {
	readonly commit: string;
	readonly sourceBlobs: Readonly<Record<string, string>>;
}

export type HostVerificationResult =
	| { readonly ok: true; readonly evidence: HostVerificationEvidence }
	| { readonly ok: false; readonly error: string };

interface CommandResult {
	readonly exitCode: number;
	readonly stdout: string;
	readonly stderr: string;
}

async function runGit(
	args: readonly string[],
	cwd?: string,
): Promise<CommandResult> {
	const child = Bun.spawn(["git", ...args], {
		...(cwd ? { cwd } : {}),
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		child.exited,
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
	]);
	return { exitCode, stdout: stdout.trim(), stderr: stderr.trim() };
}

function sha256(bytes: Uint8Array): string {
	return createHash("sha256").update(bytes).digest("hex");
}

/**
 * A pinned source path, resolved only if it stays inside the checkout.
 *
 * The keys come from caller-supplied compatibility config, so a key such as `../../etc/passwd`
 * would otherwise be read and its hash disclosed through the mismatch message.
 */
function containedSourcePath(root: string, relative: string): string {
	if (
		!relative ||
		relative.includes("\\") ||
		relative.includes("\0") ||
		isAbsolute(relative) ||
		normalize(relative) !== relative ||
		relative
			.split("/")
			.some(
				(segment) =>
					!segment || segment === "." || segment === ".." || segment === ".git",
			)
	) {
		throw new Error(`Unsafe pinned source path: ${relative}`);
	}
	const path = resolve(root, relative);
	if (!path.startsWith(`${root}${sep}`)) {
		throw new Error(`Pinned source path escapes the checkout: ${relative}`);
	}
	return path;
}

/** A full 40-character hexadecimal commit, so it can never be read by git as an option. */
function isCommitSha(value: string): boolean {
	return /^[0-9a-f]{40}$/.test(value);
}

export async function verifyHostCheckout(
	compatibility: HostCompatibility,
	checkout: string,
): Promise<HostVerificationResult> {
	const root = resolve(checkout);
	if (!isCommitSha(compatibility.commit)) {
		return {
			ok: false,
			error: `Host commit must be a full hexadecimal SHA: ${compatibility.commit}`,
		};
	}
	const revision = await runGit(["rev-parse", "HEAD"], root);
	if (revision.exitCode !== 0) {
		return { ok: false, error: revision.stderr || "Unable to read host HEAD" };
	}
	if (revision.stdout !== compatibility.commit) {
		return {
			ok: false,
			error: `Host commit mismatch: expected ${compatibility.commit}, received ${revision.stdout}`,
		};
	}

	const observed: Record<string, string> = {};
	for (const [path, expectedHash] of Object.entries(
		compatibility.sourceBlobs ?? {},
	)) {
		try {
			const actualHash = sha256(
				await readFile(containedSourcePath(root, path)),
			);
			if (actualHash !== expectedHash) {
				return {
					ok: false,
					error: `Source blob mismatch for ${path}: expected ${expectedHash}, received ${actualHash}`,
				};
			}
			observed[path] = actualHash;
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "unreadable source";
			return { ok: false, error: `Unable to verify ${path}: ${message}` };
		}
	}

	return {
		ok: true,
		evidence: { commit: revision.stdout, sourceBlobs: observed },
	};
}

export async function verifyHostRemote(
	compatibility: HostCompatibility,
	remote = compatibility.repository,
): Promise<HostVerificationResult> {
	if (!isCommitSha(compatibility.commit)) {
		return {
			ok: false,
			error: `Host commit must be a full hexadecimal SHA: ${compatibility.commit}`,
		};
	}
	if (!remote || remote.startsWith("-")) {
		return { ok: false, error: `Unsafe host remote: ${remote}` };
	}
	const temporaryCheckout = await mkdtemp(join(tmpdir(), "gui-pack-host-"));
	try {
		const initialized = await runGit(["init", "--quiet"], temporaryCheckout);
		if (initialized.exitCode !== 0) {
			return { ok: false, error: initialized.stderr };
		}
		const fetched = await runGit(
			["fetch", "--quiet", "--depth=1", "--", remote, compatibility.commit],
			temporaryCheckout,
		);
		if (fetched.exitCode !== 0) {
			return {
				ok: false,
				error: `Host commit is not reachable from ${remote}: ${fetched.stderr}`,
			};
		}
		const checkedOut = await runGit(
			["checkout", "--quiet", "--detach", "FETCH_HEAD"],
			temporaryCheckout,
		);
		if (checkedOut.exitCode !== 0) {
			return { ok: false, error: checkedOut.stderr };
		}
		return await verifyHostCheckout(compatibility, temporaryCheckout);
	} finally {
		await rm(temporaryCheckout, { recursive: true, force: true });
	}
}
