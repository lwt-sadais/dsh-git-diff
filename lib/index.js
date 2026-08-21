import { randomUUID } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import { diffLines } from "diff";
import { isIP } from "node:net";
//#region src/host/diff-service.ts
const MAX_FILE_BYTES = 2097152;
const MAX_TOTAL_BYTES = 16777216;
const MAX_REPOSITORIES = 128;
const MAX_MANIFESTS = 8;
const MANIFEST_TTL_MS = 3e5;
const EMPTY_LINE = {
	kind: "empty",
	text: "",
	lineNumber: null
};
function fail(code, message) {
	return {
		ok: false,
		error: {
			code,
			message
		}
	};
}
function splitLines(content) {
	if (content === "") return [];
	const lines = content.replace(/\r\n/gu, "\n").split("\n");
	if (lines.at(-1) === "") lines.pop();
	return lines;
}
function line(kind, text, lineNumber, partnerKind) {
	return {
		kind,
		text,
		lineNumber,
		...partnerKind === void 0 ? {} : { partnerKind }
	};
}
function alignDiff(before, after) {
	const chunks = diffLines(before, after, {
		newlineIsToken: false,
		stripTrailingCr: true
	});
	const rows = [];
	const markers = [];
	let beforeLine = 1;
	let afterLine = 1;
	let index = 0;
	for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
		const chunk = chunks[chunkIndex];
		if (chunk.removed && chunks[chunkIndex + 1]?.added) {
			const inserted = chunks[chunkIndex + 1];
			const leftLines = splitLines(chunk.value);
			const rightLines = splitLines(inserted.value);
			const count = Math.max(leftLines.length, rightLines.length);
			for (let offset = 0; offset < count; offset += 1) {
				const leftText = leftLines[offset];
				const rightText = rightLines[offset];
				const left = leftText === void 0 ? EMPTY_LINE : line("modify", leftText, beforeLine++, "delete");
				const right = rightText === void 0 ? EMPTY_LINE : line("modify", rightText, afterLine++, "insert");
				rows.push({
					index,
					left,
					right,
					changed: true
				});
				if (leftText !== void 0) markers.push({
					row: index,
					kind: "delete"
				});
				if (rightText !== void 0) markers.push({
					row: index,
					kind: "insert"
				});
				index += 1;
			}
			chunkIndex += 1;
			continue;
		}
		for (const value of splitLines(chunk.value)) {
			if (chunk.removed) {
				rows.push({
					index,
					left: line("delete", value, beforeLine++),
					right: EMPTY_LINE,
					changed: true
				});
				markers.push({
					row: index,
					kind: "delete"
				});
			} else if (chunk.added) {
				rows.push({
					index,
					left: EMPTY_LINE,
					right: line("insert", value, afterLine++),
					changed: true
				});
				markers.push({
					row: index,
					kind: "insert"
				});
			} else rows.push({
				index,
				left: line("equal", value, beforeLine++),
				right: line("equal", value, afterLine++),
				changed: false
			});
			index += 1;
		}
	}
	return {
		rows,
		markers
	};
}
function parseStatus(stdout) {
	const fields = stdout.split("\0");
	const entries = [];
	for (let index = 0; index < fields.length;) {
		const field = fields[index++];
		if (!field) continue;
		const code = field.slice(0, 2);
		const path = field.slice(3);
		if (code === "??") {
			entries.push({
				path,
				oldPath: null,
				status: "untracked"
			});
			continue;
		}
		const renamed = code.includes("R");
		const oldPath = renamed ? fields[index++] ?? null : null;
		const status = renamed ? "renamed" : code.includes("A") ? "added" : code.includes("D") ? "deleted" : "modified";
		entries.push({
			path,
			oldPath,
			status
		});
	}
	return entries;
}
/** Parse `git config --file .gitmodules --get-regexp ...` into declared paths. */
function parseSubmodulePaths(stdout) {
	return stdout.split("\n").flatMap((line) => {
		const separator = line.search(/\s/u);
		if (separator < 0) return [];
		const path = line.slice(separator).trim();
		return path === "" ? [] : [path];
	});
}
function safePath(root, path) {
	if (isAbsolute(path) || path.includes("\0")) return null;
	const absolute = resolve(root, path);
	const rel = relative(root, absolute);
	return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel) ? absolute : null;
}
function workspacePath(repositoryPath, filePath) {
	return repositoryPath === "" ? filePath : `${repositoryPath}/${filePath}`;
}
function isBinary(content) {
	return content.includes("\0");
}
function flatten(repository) {
	return [...repository.files, ...repository.children.flatMap(flatten)];
}
var DiffService = class {
	runner;
	gate;
	constructor(runner, gate) {
		this.runner = runner;
		this.gate = gate;
	}
	manifests = /* @__PURE__ */ new Map();
	async repositorySnapshot(absoluteRoot, repositoryPath, budget, entries, signal) {
		signal?.throwIfAborted();
		budget.repositories += 1;
		if (budget.repositories > MAX_REPOSITORIES) throw new Error("repository limit exceeded");
		const status = await this.runner.run([
			"status",
			"--porcelain=v1",
			"-z",
			"--untracked-files=all"
		], absoluteRoot, signal);
		if (status.exitCode !== 0) throw new Error("unable to read Git working tree status");
		const statusEntries = parseStatus(status.stdout);
		const modules = await this.runner.run([
			"config",
			"--file",
			".gitmodules",
			"--get-regexp",
			"^submodule\\..*\\.path$"
		], absoluteRoot, signal);
		const declaredPaths = modules.exitCode === 0 ? parseSubmodulePaths(modules.stdout) : [];
		const changedPaths = new Set(statusEntries.map((entry) => entry.path));
		const children = [];
		for (const childRelativePath of declaredPaths) {
			const childRoot = safePath(absoluteRoot, childRelativePath);
			if (childRoot === null) continue;
			const childRepositoryPath = workspacePath(repositoryPath, childRelativePath);
			const probe = await this.runner.run(["rev-parse", "--show-toplevel"], childRoot, signal);
			let initialized = false;
			if (probe.exitCode === 0) try {
				initialized = await realpath(probe.stdout.trim()) === await realpath(childRoot);
			} catch {
				initialized = false;
			}
			const headChanged = changedPaths.has(childRelativePath);
			if (initialized) {
				const child = await this.repositorySnapshot(childRoot, childRepositoryPath, budget, entries, signal);
				children.push({
					...child,
					headChanged
				});
			} else children.push({
				path: childRepositoryPath,
				name: basename(childRelativePath),
				initialized: false,
				headChanged,
				files: [],
				children: []
			});
		}
		const childPaths = new Set(declaredPaths);
		const files = [];
		for (const entry of statusEntries) {
			signal?.throwIfAborted();
			if (childPaths.has(entry.path) || safePath(absoluteRoot, entry.path) === null) continue;
			const id = randomUUID();
			const summary = {
				id,
				path: workspacePath(repositoryPath, entry.path),
				repositoryRelativePath: entry.path,
				repositoryPath,
				oldPath: entry.oldPath === null ? null : workspacePath(repositoryPath, entry.oldPath),
				status: entry.status
			};
			files.push(summary);
			entries.set(id, {
				summary,
				repositoryRoot: absoluteRoot,
				sourcePath: entry.oldPath ?? entry.path
			});
		}
		return {
			path: repositoryPath,
			name: repositoryPath === "" ? basename(absoluteRoot) : basename(repositoryPath),
			initialized: true,
			headChanged: false,
			files,
			children
		};
	}
	async file(request, signal) {
		const workspace = await this.gate.resolve(request.path);
		if (!workspace.ok) return workspace;
		const manifest = this.manifests.get(request.manifestId);
		if (manifest === void 0 || manifest.expiresAt <= Date.now() || manifest.workspace !== workspace.value) {
			this.manifests.delete(request.manifestId);
			return fail("manifest-stale", "Git diff manifest has expired; refresh local changes");
		}
		const entry = manifest.files.get(request.fileId);
		if (entry === void 0) return fail("file-unknown", "file is not present in this Git diff manifest");
		const { summary, repositoryRoot, sourcePath } = entry;
		const diskPath = safePath(repositoryRoot, summary.repositoryRelativePath);
		if (diskPath === null) return fail("file-unknown", "file path is invalid");
		try {
			let before = "";
			let after = "";
			let binary = false;
			let truncated = false;
			if (summary.status !== "added" && summary.status !== "untracked") {
				const previous = await this.runner.run(["show", `HEAD:${sourcePath}`], repositoryRoot, signal);
				if (previous.exitCode !== 0) return fail("manifest-stale", "Git baseline changed; refresh local changes");
				before = previous.stdout;
			}
			if (summary.status !== "deleted") {
				const stat = await lstat(diskPath);
				if (!stat.isFile() || stat.isSymbolicLink()) return fail("file-unknown", "changed path is not a regular file");
				const canonicalFile = await realpath(diskPath);
				const canonicalRelative = relative(repositoryRoot, canonicalFile);
				if (canonicalRelative === "" || canonicalRelative === ".." || canonicalRelative.startsWith(`..${sep}`) || isAbsolute(canonicalRelative)) return fail("file-unknown", "changed file resolves outside its repository");
				const buffer = await readFile(canonicalFile);
				truncated = buffer.byteLength > MAX_FILE_BYTES;
				const bounded = truncated ? buffer.subarray(0, MAX_FILE_BYTES) : buffer;
				after = bounded.toString("utf8");
				binary = bounded.includes(0);
			}
			binary ||= isBinary(before);
			if (Buffer.byteLength(before) + Buffer.byteLength(after) > MAX_TOTAL_BYTES) return fail("too-large", "file diff exceeds the review limit");
			const aligned = binary ? {
				rows: [],
				markers: []
			} : alignDiff(before, after);
			return {
				ok: true,
				value: {
					...summary,
					binary,
					truncated,
					before,
					after,
					rows: aligned.rows,
					markers: aligned.markers
				}
			};
		} catch (cause) {
			if (cause instanceof Error && cause.name === "AbortError") throw cause;
			return fail("manifest-stale", "changed file is no longer available; refresh local changes");
		}
	}
	async snapshot(path, signal) {
		const workspace = await this.gate.resolve(path);
		if (!workspace.ok) return workspace;
		const rootResult = await this.runner.run(["rev-parse", "--show-toplevel"], workspace.value, signal);
		if (rootResult.exitCode !== 0) return fail("not-git-repository", "workspace is not a Git repository");
		let root;
		try {
			root = await realpath(rootResult.stdout.trim());
			if (root !== workspace.value) return fail("workspace-unknown", "workspace must be the Git repository root");
		} catch {
			return fail("not-git-repository", "Git repository root is unavailable");
		}
		try {
			const entries = /* @__PURE__ */ new Map();
			const repository = await this.repositorySnapshot(root, "", { repositories: 0 }, entries, signal);
			const manifestId = randomUUID();
			const now = Date.now();
			for (const [id, manifest] of this.manifests) if (manifest.expiresAt <= now) this.manifests.delete(id);
			while (this.manifests.size >= MAX_MANIFESTS) this.manifests.delete(this.manifests.keys().next().value);
			this.manifests.set(manifestId, {
				workspace: root,
				expiresAt: now + MANIFEST_TTL_MS,
				files: entries
			});
			return {
				ok: true,
				value: {
					manifestId,
					generatedAt: new Date(now).toISOString(),
					files: flatten(repository),
					repository
				}
			};
		} catch (cause) {
			if ((cause instanceof Error ? cause.message : "").includes("limit")) return fail("too-large", "repository diff exceeds the review limit");
			return fail("internal", "unable to read Git working tree status");
		}
	}
};
function createWorkspaceGate(workspaces) {
	return { async resolve(path) {
		let canonical;
		try {
			canonical = await realpath(path);
		} catch {
			return fail("workspace-unknown", "workspace path does not resolve");
		}
		return workspaces().some((workspace) => workspace.path === canonical) ? {
			ok: true,
			value: canonical
		} : fail("workspace-unknown", "path is not a registered workspace");
	} };
}
function subprocessRunner(ctx) {
	return { async run(argv, cwd, signal) {
		const handle = ctx.subprocess.spawn({
			argv: ["git", ...argv],
			cwd,
			stdio: {
				stdin: "ignore",
				stdout: { maxBytes: MAX_TOTAL_BYTES },
				stderr: { maxBytes: MAX_FILE_BYTES }
			},
			graceMs: 5e3,
			...signal === void 0 ? {} : { signal }
		});
		return {
			exitCode: (await handle.done).exitCode,
			stdout: handle.collected.stdout?.readFrom(0).text ?? "",
			stderr: handle.collected.stderr?.readFrom(0).text ?? ""
		};
	} };
}
//#endregion
//#region src/host/routes.ts
const SNAPSHOT_ROUTE = "/api/dsh-git-diff/snapshot";
const FILE_ROUTE = "/api/dsh-git-diff/file";
const BODY_CAP = 16384;
function allowed(req) {
	const address = req.socket.remoteAddress?.replace(/^::ffff:/u, "");
	if (address === void 0 || address !== "::1" && !(isIP(address) === 4 && address.startsWith("127."))) return false;
	const contentType = req.headers["content-type"];
	if (typeof contentType !== "string" || !contentType.toLowerCase().startsWith("application/json")) return false;
	const origin = req.headers.origin;
	const host = req.headers.host;
	return typeof origin === "string" && typeof host === "string" && origin === `http://${host}`;
}
async function readBody(req) {
	const chunks = [];
	let bytes = 0;
	for await (const chunk of req) {
		const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		bytes += buffer.byteLength;
		if (bytes > BODY_CAP) throw new Error("body too large");
		chunks.push(buffer);
	}
	return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
function recordOf(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function boundedString(value, allowEmpty = false) {
	return typeof value === "string" && value.length <= 4096 && (allowEmpty || value.length > 0) ? value : null;
}
function pathOf(value) {
	const record = recordOf(value);
	if (record === null || Object.keys(record).length !== 1) return null;
	return boundedString(record.path);
}
function fileRequestOf(value) {
	const record = recordOf(value);
	if (record === null || Object.keys(record).length !== 3) return null;
	const path = boundedString(record.path);
	const manifestId = boundedString(record.manifestId);
	const fileId = boundedString(record.fileId);
	return path === null || manifestId === null || fileId === null ? null : {
		path,
		manifestId,
		fileId
	};
}
function send(res, status, result) {
	res.statusCode = status;
	res.setHeader("content-type", "application/json; charset=utf-8");
	res.setHeader("cache-control", "no-store");
	res.setHeader("x-content-type-options", "nosniff");
	res.end(JSON.stringify(result));
}
function registerRoute(ctx, route, parse, run) {
	return ctx.webServer.register({
		kind: "exact",
		path: route,
		handler: async (req, res) => {
			if (req.method !== "POST" || !allowed(req)) {
				send(res, 403, {
					ok: false,
					error: {
						code: "invalid-request",
						message: "local same-origin JSON POST required"
					}
				});
				return;
			}
			const controller = new AbortController();
			const abort = () => controller.abort();
			req.once("aborted", abort);
			res.once("close", abort);
			try {
				const value = parse(await readBody(req));
				if (value === null) {
					send(res, 400, {
						ok: false,
						error: {
							code: "invalid-request",
							message: "invalid Git diff request"
						}
					});
					return;
				}
				const result = await run(value, controller.signal);
				if (!controller.signal.aborted && !res.destroyed) send(res, result.ok ? 200 : 400, result);
			} catch (cause) {
				if (!controller.signal.aborted && !res.destroyed) {
					ctx.logger.warn(`dsh-git-diff: request failed: ${String(cause)}`);
					send(res, 500, {
						ok: false,
						error: {
							code: "internal",
							message: "unable to build Git diff response"
						}
					});
				}
			} finally {
				req.off("aborted", abort);
				res.off("close", abort);
			}
		}
	});
}
function registerRoutes(ctx, service) {
	const disposeSnapshot = registerRoute(ctx, SNAPSHOT_ROUTE, pathOf, (path, signal) => service.snapshot(path, signal));
	const disposeFile = registerRoute(ctx, FILE_ROUTE, fileRequestOf, (request, signal) => service.file(request, signal));
	return () => {
		disposeFile();
		disposeSnapshot();
	};
}
//#endregion
//#region src/index.ts
const name = "dsh-git-diff";
const inject = [
	"webServer",
	"subprocess",
	"workspaceRegistry"
];
function apply(ctx) {
	const service = new DiffService(subprocessRunner(ctx), createWorkspaceGate(() => ctx.workspaceRegistry.list()));
	ctx.effect(() => registerRoutes(ctx, service), "dsh-git-diff: snapshot route");
}
//#endregion
export { DiffService, alignDiff, apply, inject, name };

//# sourceMappingURL=index.js.map