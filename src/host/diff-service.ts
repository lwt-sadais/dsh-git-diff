import { readFile, realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { diffLines } from 'diff'
import type { ApiError, ApiResult, ChangeMarker, DiffFile, DiffLine, DiffResponse, DiffRow } from '../core/types.js'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const MAX_TOTAL_BYTES = 16 * 1024 * 1024
const EMPTY_LINE: DiffLine = { kind: 'empty', text: '', lineNumber: null }

export interface GitRunResult {
  readonly exitCode: number | null
  readonly stdout: string
  readonly stderr: string
}

export interface GitRunner {
  run(argv: readonly string[], cwd: string, signal?: AbortSignal): Promise<GitRunResult>
}

export interface WorkspaceGate {
  resolve(path: string): Promise<ApiResult<string>>
}

export interface StatusEntry {
  readonly path: string
  readonly oldPath: string | null
  readonly status: DiffFile['status']
}

function fail(code: ApiError['code'], message: string): ApiResult<never> {
  return { ok: false, error: { code, message } }
}

function splitLines(content: string): string[] {
  if (content === '') return []
  const lines = content.replace(/\r\n/gu, '\n').split('\n')
  if (lines.at(-1) === '') lines.pop()
  return lines
}

function line(kind: DiffLine['kind'], text: string, lineNumber: number, partnerKind?: 'delete' | 'insert'): DiffLine {
  return { kind, text, lineNumber, ...(partnerKind === undefined ? {} : { partnerKind }) }
}

export function alignDiff(before: string, after: string): { rows: readonly DiffRow[], markers: readonly ChangeMarker[] } {
  const chunks = diffLines(before, after, { newlineIsToken: false })
  const rows: DiffRow[] = []
  const markers: ChangeMarker[] = []
  let beforeLine = 1
  let afterLine = 1
  let index = 0

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
    const chunk = chunks[chunkIndex]!
    if (chunk.removed && chunks[chunkIndex + 1]?.added) {
      const inserted = chunks[chunkIndex + 1]!
      const leftLines = splitLines(chunk.value)
      const rightLines = splitLines(inserted.value)
      const count = Math.max(leftLines.length, rightLines.length)
      for (let offset = 0; offset < count; offset += 1) {
        const leftText = leftLines[offset]
        const rightText = rightLines[offset]
        const left = leftText === undefined ? EMPTY_LINE : line('modify', leftText, beforeLine++, 'delete')
        const right = rightText === undefined ? EMPTY_LINE : line('modify', rightText, afterLine++, 'insert')
        rows.push({ index, left, right, changed: true })
        if (leftText !== undefined) markers.push({ row: index, kind: 'delete' })
        if (rightText !== undefined) markers.push({ row: index, kind: 'insert' })
        index += 1
      }
      chunkIndex += 1
      continue
    }

    const values = splitLines(chunk.value)
    for (const value of values) {
      if (chunk.removed) {
        rows.push({ index, left: line('delete', value, beforeLine++), right: EMPTY_LINE, changed: true })
        markers.push({ row: index, kind: 'delete' })
      } else if (chunk.added) {
        rows.push({ index, left: EMPTY_LINE, right: line('insert', value, afterLine++), changed: true })
        markers.push({ row: index, kind: 'insert' })
      } else {
        rows.push({ index, left: line('equal', value, beforeLine++), right: line('equal', value, afterLine++), changed: false })
      }
      index += 1
    }
  }
  return { rows, markers }
}

export function parseStatus(stdout: string): StatusEntry[] {
  const fields = stdout.split('\0')
  const entries: StatusEntry[] = []
  for (let index = 0; index < fields.length;) {
    const field = fields[index++]
    if (!field) continue
    const code = field.slice(0, 2)
    const path = field.slice(3)
    if (code === '??') {
      entries.push({ path, oldPath: null, status: 'untracked' })
      continue
    }
    const renamed = code.includes('R')
    // In porcelain v1 -z the first rename path is the destination and the
    // following NUL field is the source (the reverse of human output).
    const oldPath = renamed ? fields[index++] ?? null : null
    const status: DiffFile['status'] = renamed ? 'renamed'
      : code.includes('A') ? 'added'
        : code.includes('D') ? 'deleted'
          : 'modified'
    entries.push({ path, oldPath, status })
  }
  return entries
}

function safePath(root: string, path: string): string | null {
  if (isAbsolute(path) || path.includes('\0')) return null
  const absolute = resolve(root, path)
  const rel = relative(root, absolute)
  return rel !== '' && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel) ? absolute : null
}

function isBinary(content: string): boolean {
  return content.includes('\0')
}

export class DiffService {
  constructor(private readonly runner: GitRunner, private readonly gate: WorkspaceGate) {}

  async snapshot(path: string, signal?: AbortSignal): Promise<ApiResult<DiffResponse>> {
    const workspace = await this.gate.resolve(path)
    if (!workspace.ok) return workspace
    const rootResult = await this.runner.run(['rev-parse', '--show-toplevel'], workspace.value, signal)
    if (rootResult.exitCode !== 0) return fail('not-git-repository', 'workspace is not a Git repository')
    let root: string
    try {
      root = await realpath(rootResult.stdout.trim())
    } catch {
      return fail('not-git-repository', 'Git repository root is unavailable')
    }
    const status = await this.runner.run(['status', '--porcelain=v1', '-z', '--untracked-files=all'], root, signal)
    if (status.exitCode !== 0) return fail('internal', 'unable to read Git working tree status')

    const files: DiffFile[] = []
    let totalBytes = 0
    for (const entry of parseStatus(status.stdout)) {
      signal?.throwIfAborted()
      const diskPath = safePath(root, entry.path)
      if (diskPath === null) continue
      let before = ''
      let after = ''
      let binary = false
      let truncated = false

      if (entry.status !== 'added' && entry.status !== 'untracked') {
        const sourcePath = entry.oldPath ?? entry.path
        const previous = await this.runner.run(['show', `HEAD:${sourcePath}`], root, signal)
        if (previous.exitCode === 0) before = previous.stdout
      }
      if (entry.status !== 'deleted') {
        try {
          const buffer = await readFile(diskPath)
          truncated = buffer.byteLength > MAX_FILE_BYTES
          const bounded = truncated ? buffer.subarray(0, MAX_FILE_BYTES) : buffer
          after = bounded.toString('utf8')
          binary = bounded.includes(0)
        } catch {
          after = ''
        }
      }
      binary ||= isBinary(before)
      totalBytes += Buffer.byteLength(before) + Buffer.byteLength(after)
      if (totalBytes > MAX_TOTAL_BYTES) return fail('too-large', 'working tree diff exceeds the 16 MiB review limit')
      const aligned = binary ? { rows: [], markers: [] } : alignDiff(before, after)
      files.push({
        path: entry.path,
        oldPath: entry.oldPath,
        status: entry.status,
        binary,
        truncated,
        before,
        after,
        rows: aligned.rows,
        markers: aligned.markers,
      })
    }

    return { ok: true, value: { root, generatedAt: new Date().toISOString(), files } }
  }
}

export function createWorkspaceGate(workspaces: () => readonly { readonly path: string }[]): WorkspaceGate {
  return {
    async resolve(path) {
      let canonical: string
      try {
        canonical = await realpath(path)
      } catch {
        return fail('workspace-unknown', 'workspace path does not resolve')
      }
      return workspaces().some(workspace => workspace.path === canonical)
        ? { ok: true, value: canonical }
        : fail('workspace-unknown', 'path is not a registered workspace')
    },
  }
}

export function subprocessRunner(ctx: { subprocess: { spawn(spec: {
  argv: readonly string[]
  cwd: string
  stdio: { stdin: 'ignore', stdout: { maxBytes: number }, stderr: { maxBytes: number } }
  graceMs: number
  signal?: AbortSignal
}): { done: Promise<{ exitCode: number | null }>, collected: { stdout?: { readFrom(offset: number): { text: string } }, stderr?: { readFrom(offset: number): { text: string } } } } } }): GitRunner {
  return {
    async run(argv, cwd, signal) {
      const handle = ctx.subprocess.spawn({
        argv: ['git', ...argv],
        cwd,
        stdio: { stdin: 'ignore', stdout: { maxBytes: MAX_TOTAL_BYTES }, stderr: { maxBytes: MAX_FILE_BYTES } },
        graceMs: 5_000,
        ...(signal === undefined ? {} : { signal }),
      })
      const outcome = await handle.done
      return {
        exitCode: outcome.exitCode,
        stdout: handle.collected.stdout?.readFrom(0).text ?? '',
        stderr: handle.collected.stderr?.readFrom(0).text ?? '',
      }
    },
  }
}
