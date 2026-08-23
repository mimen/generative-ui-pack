import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	type HostCompatibility,
	verifyHostCheckout,
	verifyHostRemote,
} from "../src/compiler/index";

let repository = "";
let compatibility: HostCompatibility;
const sourcePath = "app/src/components/gallery/cards.tsx";
const source = "export const pinned = true;\n";

async function git(args: readonly string[], cwd: string): Promise<string> {
	const child = Bun.spawn(["git", ...args], {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stdout, stderr] = await Promise.all([
		child.exited,
		new Response(child.stdout).text(),
		new Response(child.stderr).text(),
	]);
	if (exitCode !== 0) throw new Error(stderr);
	return stdout.trim();
}

beforeAll(async () => {
	repository = await mkdtemp(join(tmpdir(), "gui-pack-verify-test-"));
	await git(["init", "--quiet"], repository);
	await git(["config", "user.email", "test@example.com"], repository);
	await git(["config", "user.name", "Test"], repository);
	await mkdir(join(repository, "app/src/components/gallery"), {
		recursive: true,
	});
	await writeFile(join(repository, sourcePath), source, "utf8");
	await git(["add", sourcePath], repository);
	await git(["commit", "--quiet", "-m", "fixture"], repository);
	const commit = await git(["rev-parse", "HEAD"], repository);
	compatibility = {
		repository,
		commit,
		contractVersion: 1,
		components: ["record"],
		sourceBlobs: {
			[sourcePath]: createHash("sha256").update(source).digest("hex"),
		},
	};
});

afterAll(async () => {
	await rm(repository, { recursive: true, force: true });
});

describe("host compatibility verification", () => {
	test("verifies checkout commit identity and source blobs", async () => {
		const result = await verifyHostCheckout(compatibility, repository);
		expect(result.ok).toBe(true);
	});

	test("verifies a supplied remote commit is reachable", async () => {
		const result = await verifyHostRemote(compatibility, repository);
		expect(result.ok).toBe(true);
	});

	test("fails closed when a pinned source blob changes", async () => {
		await writeFile(join(repository, sourcePath), "changed\n", "utf8");
		const result = await verifyHostCheckout(compatibility, repository);
		expect(result.ok).toBe(false);
		await writeFile(join(repository, sourcePath), source, "utf8");
	});
});
