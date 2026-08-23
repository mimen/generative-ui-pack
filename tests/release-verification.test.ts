import { afterAll, beforeAll, describe, test } from "bun:test";
import { cp, mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { verifyRelease } from "../scripts/verify-release";

let temporaryRoot = "";
let repositoryPath = "";
let repositoryUrl = "";
let server: ReturnType<typeof Bun.serve> | undefined;

async function git(args: readonly string[], cwd: string): Promise<void> {
	const child = Bun.spawn(["git", ...args], {
		cwd,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [exitCode, stderr] = await Promise.all([
		child.exited,
		new Response(child.stderr).text(),
	]);
	if (exitCode !== 0) throw new Error(stderr);
}

beforeAll(async () => {
	temporaryRoot = await mkdtemp(join(tmpdir(), "gui-pack-release-test-"));
	repositoryPath = join(temporaryRoot, "repository");
	await mkdir(repositoryPath);
	const source = resolve(import.meta.dir, "..");
	await cp(source, repositoryPath, {
		recursive: true,
		filter: (path) =>
			![".git", "node_modules", "generated", "evidence"].includes(
				path.split(sep).at(-1) ?? "",
			),
	});
	await git(["init", "--quiet"], repositoryPath);
	await git(["config", "user.email", "test@example.com"], repositoryPath);
	await git(["config", "user.name", "Test"], repositoryPath);
	await git(["add", "."], repositoryPath);
	await git(["commit", "--quiet", "-m", "release fixture"], repositoryPath);
	await git(["tag", "-a", "v0.1.0", "-m", "release"], repositoryPath);

	const bareRepository = join(temporaryRoot, "repository.git");
	await git(
		["clone", "--quiet", "--bare", repositoryPath, bareRepository],
		temporaryRoot,
	);
	await git(["--git-dir", bareRepository, "update-server-info"], temporaryRoot);
	const bareRoot = resolve(bareRepository);
	server = Bun.serve({
		port: 0,
		async fetch(request): Promise<Response> {
			const pathname = decodeURIComponent(new URL(request.url).pathname);
			const relative = pathname.replace(/^\/repository\.git\/?/, "");
			const candidate = resolve(bareRoot, relative);
			if (
				candidate !== bareRoot &&
				!candidate.startsWith(`${bareRoot}${sep}`)
			) {
				return new Response("Not found", { status: 404 });
			}
			const file = Bun.file(candidate);
			if (!(await file.exists()))
				return new Response("Not found", { status: 404 });
			return new Response(file);
		},
	});
	repositoryUrl = `http://127.0.0.1:${server.port}/repository.git`;
});

afterAll(async () => {
	server?.stop(true);
	await rm(temporaryRoot, { recursive: true, force: true });
});

describe("release and clean-consumer gates", () => {
	test("verifies the default tagged Git install, exports, CSS, and CLI", async () => {
		await verifyRelease(repositoryUrl, "v0.1.0", { verifyHosts: false });
	}, 120_000);
});
