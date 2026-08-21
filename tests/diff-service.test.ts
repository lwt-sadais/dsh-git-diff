import { describe, expect, it } from 'vitest'
import { alignDiff, parseStatus } from '../src/host/diff-service.js'

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
