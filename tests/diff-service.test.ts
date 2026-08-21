import { mkdtemp, realpath, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { alignDiff, DiffService, parseStatus, parseSubmodulePaths, type GitRunner } from '../src/host/diff-service.js'

describe('alignDiff', () => {
  it('aligns replacement rows into an integrated red-green pair', () => {
    const result = alignDiff('one\ntwo\nthree\n', 'one\nTWO\nthree\n')
    expect(result.rows).toHaveLength(3)
    expect(result.rows[1]?.left).toMatchObject({ kind: 'modify', partnerKind: 'delete', text: 'two', lineNumber: 2 })
    expect(result.rows[1]?.right).toMatchObject({ kind: 'modify', partnerKind: 'insert', text: 'TWO', lineNumber: 2 })
    expect(result.markers).toEqual([{ row: 1, kind: 'delete' }, { row: 1, kind: 'insert' }])
  })

  it('pads pure additions with an empty left row', () => {
    const result = alignDiff('one\n', 'one\ntwo\n')
    expect(result.rows[1]?.left.kind).toBe('empty')
    expect(result.rows[1]?.right).toMatchObject({ kind: 'insert', text: 'two', lineNumber: 2 })
  })

  it('ignores LF versus CRLF when the content is unchanged', () => {
    const result = alignDiff('one\ntwo\nthree\n', 'one\r\ntwo\r\nthree\r\n')
    expect(result.rows.map(row => row.changed)).toEqual([false, false, false])
    expect(result.markers).toEqual([])
  })

  it('highlights only the edited Java line across LF and CRLF inputs', () => {
    const result = alignDiff(
      'package demo;\n\nclass App {\n  int value = 1;\n}\n',
      'package demo;\r\n\r\nclass App {\r\n  int value = 2;\r\n}\r\n',
    )
    expect(result.rows.map(row => row.changed)).toEqual([false, false, false, true, false])
    expect(result.rows[3]?.left).toMatchObject({ kind: 'modify', text: '  int value = 1;', lineNumber: 4 })
    expect(result.rows[3]?.right).toMatchObject({ kind: 'modify', text: '  int value = 2;', lineNumber: 4 })
    expect(result.markers).toEqual([{ row: 3, kind: 'delete' }, { row: 3, kind: 'insert' }])
  })
})

describe('DiffService lazy loading', () => {
  it('returns a lightweight manifest and reads file content only on file request', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dgd-lazy-'))
    await writeFile(join(root, 'App.java'), 'class App {\r\n  int value = 2;\r\n}\r\n')
    const canonicalRoot = await realpath(root)
    const calls: string[][] = []
    const runner: GitRunner = {
      async run(argv) {
        calls.push([...argv])
        const command = argv.join(' ')
        if (command === 'rev-parse --show-toplevel') return { exitCode: 0, stdout: `${canonicalRoot}\n`, stderr: '' }
        if (command === 'status --porcelain=v1 -z --untracked-files=all') return { exitCode: 0, stdout: ' M App.java\0', stderr: '' }
        if (command.startsWith('config --file')) return { exitCode: 1, stdout: '', stderr: '' }
        if (command === 'show HEAD:App.java') return { exitCode: 0, stdout: 'class App {\n  int value = 1;\n}\n', stderr: '' }
        return { exitCode: 1, stdout: '', stderr: '' }
      },
    }
    const service = new DiffService(runner, { async resolve() { return { ok: true, value: canonicalRoot } } })

    const snapshot = await service.snapshot(root)
    expect(snapshot.ok).toBe(true)
    if (!snapshot.ok) return
    expect(snapshot.value.files).toHaveLength(1)
    expect(snapshot.value.files[0]).toMatchObject({
      path: 'App.java', repositoryRelativePath: 'App.java', repositoryPath: '', oldPath: null, status: 'modified',
    })
    expect(calls.some(call => call[0] === 'show')).toBe(false)

    const detail = await service.file({ path: root, manifestId: snapshot.value.manifestId, fileId: snapshot.value.files[0]!.id })
    expect(detail.ok).toBe(true)
    if (!detail.ok) return
    expect(detail.value.rows.map(row => row.changed)).toEqual([false, true, false])
    expect(calls.filter(call => call[0] === 'show')).toHaveLength(1)
  })

  it('rejects an untracked symlink that resolves outside the repository', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dgd-link-root-'))
    const outside = await mkdtemp(join(tmpdir(), 'dgd-link-outside-'))
    await writeFile(join(outside, 'secret.txt'), 'secret\n')
    await symlink(join(outside, 'secret.txt'), join(root, 'link.txt'))
    const canonicalRoot = await realpath(root)
    const runner: GitRunner = {
      async run(argv) {
        const command = argv.join(' ')
        if (command === 'rev-parse --show-toplevel') return { exitCode: 0, stdout: `${canonicalRoot}\n`, stderr: '' }
        if (command === 'status --porcelain=v1 -z --untracked-files=all') return { exitCode: 0, stdout: '?? link.txt\0', stderr: '' }
        return { exitCode: 1, stdout: '', stderr: '' }
      },
    }
    const service = new DiffService(runner, { async resolve() { return { ok: true, value: canonicalRoot } } })
    const snapshot = await service.snapshot(root)
    expect(snapshot.ok).toBe(true)
    if (!snapshot.ok) return
    const detail = await service.file({ path: root, manifestId: snapshot.value.manifestId, fileId: snapshot.value.files[0]!.id })
    expect(detail).toMatchObject({ ok: false, error: { code: 'file-unknown' } })
  })

  it('rejects unknown manifest and file identifiers', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dgd-id-'))
    const canonicalRoot = await realpath(root)
    const service = new DiffService({ async run() { return { exitCode: 1, stdout: '', stderr: '' } } }, {
      async resolve() { return { ok: true, value: canonicalRoot } },
    })
    await expect(service.file({ path: root, manifestId: 'unknown', fileId: 'unknown' })).resolves.toMatchObject({
      ok: false, error: { code: 'manifest-stale' },
    })
  })

  it('does not rebuild the manifest while loading a file detail', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dgd-cache-'))
    await writeFile(join(root, 'a.txt'), 'after\n')
    const canonicalRoot = await realpath(root)
    let statusCalls = 0
    const runner: GitRunner = {
      async run(argv) {
        const command = argv.join(' ')
        if (command === 'rev-parse --show-toplevel') return { exitCode: 0, stdout: `${canonicalRoot}\n`, stderr: '' }
        if (command === 'status --porcelain=v1 -z --untracked-files=all') { statusCalls += 1; return { exitCode: 0, stdout: ' M a.txt\0', stderr: '' } }
        if (command === 'show HEAD:a.txt') return { exitCode: 0, stdout: 'before\n', stderr: '' }
        return { exitCode: 1, stdout: '', stderr: '' }
      },
    }
    const service = new DiffService(runner, { async resolve() { return { ok: true, value: canonicalRoot } } })
    const snapshot = await service.snapshot(root)
    if (!snapshot.ok) throw new Error('snapshot failed')
    await service.file({ path: root, manifestId: snapshot.value.manifestId, fileId: snapshot.value.files[0]!.id })
    expect(statusCalls).toBe(1)
  })
})

describe('parseStatus', () => {
  it('parses modified and untracked porcelain records', () => {
    expect(parseStatus(' M src/a.ts\0?? new file.ts\0')).toEqual([
      { path: 'src/a.ts', oldPath: null, status: 'modified' },
      { path: 'new file.ts', oldPath: null, status: 'untracked' },
    ])
  })

  it('parses porcelain -z rename destination before source', () => {
    expect(parseStatus('R  new name.ts\0old name.ts\0')).toEqual([
      { path: 'new name.ts', oldPath: 'old name.ts', status: 'renamed' },
    ])
  })
})

describe('parseSubmodulePaths', () => {
  it('parses paths including whitespace from git config output', () => {
    expect(parseSubmodulePaths([
      'submodule.src/vue3-common.path src/vue3-common',
      'submodule.packages/nested.path packages/a nested/module',
      '',
    ].join('\n'))).toEqual(['src/vue3-common', 'packages/a nested/module'])
  })
})
