import { describe, expect, it } from 'vitest'
import type { DiffFile, DiffLine, DiffRow } from '../src/core/types.js'
import { diffRangeText, findDiffMatches } from '../src/client/diff-text.js'

/** Build a minimal diff file whose two sides can be searched independently. */
function makeFile(rows: readonly DiffRow[]): DiffFile {
  return {
    id: 'file', path: 'src/file.ts', repositoryRelativePath: 'src/file.ts', repositoryPath: '', oldPath: null,
    status: 'modified', binary: false, truncated: false, before: '', after: '', rows, markers: [],
  }
}

/** Build one line for compact test fixtures. */
function line(text: string, lineNumber: number | null): DiffLine {
  return { kind: lineNumber === null ? 'empty' : 'equal', text, lineNumber }
}

const file = makeFile([
  { index: 0, left: line('Before target', 1), right: line('After only', 1), changed: true },
  { index: 1, left: line('', null), right: line('target target', 2), changed: true },
  { index: 2, left: line('Tail TARGET', 2), right: line('Tail', 3), changed: true },
])

describe('findDiffMatches', () => {
  it('searches only the requested diff side across the complete file', () => {
    expect(findDiffMatches(file, 'before', 'target')).toEqual([
      { rowIndex: 0, lineNumber: 1, startColumn: 7, endColumn: 13 },
      { rowIndex: 2, lineNumber: 2, startColumn: 5, endColumn: 11 },
    ])
    expect(findDiffMatches(file, 'after', 'target')).toHaveLength(2)
  })

  it('supports case-sensitive matching and skips empty placeholders', () => {
    expect(findDiffMatches(file, 'before', 'target', true)).toHaveLength(1)
    expect(findDiffMatches(file, 'before', '', true)).toEqual([])
  })

  it('maps length-changing Unicode case folds back to original columns', () => {
    const unicodeFile = makeFile([{ index: 0, left: line('İx', 1), right: line('', null), changed: true }])
    expect(findDiffMatches(unicodeFile, 'before', 'x')).toEqual([
      { rowIndex: 0, lineNumber: 1, startColumn: 1, endColumn: 2 },
    ])
  })
})

describe('diffRangeText', () => {
  it('builds plain source text without placeholder rows', () => {
    expect(diffRangeText(file, 'before', 0, 2)).toBe('Before target\nTail TARGET')
  })
})
