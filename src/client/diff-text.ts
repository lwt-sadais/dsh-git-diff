import type { DiffFile } from '../core/types.js'

export type DiffSide = 'before' | 'after'

export interface DiffSearchMatch {
  readonly rowIndex: number
  readonly lineNumber: number
  readonly startColumn: number
  readonly endColumn: number
}

interface FoldedText {
  readonly text: string
  readonly originalStarts: readonly number[]
  readonly originalEnds: readonly number[]
}

/** Lowercase text while retaining a UTF-16 offset map back to the original string. */
function foldCase(value: string): FoldedText {
  let text = ''
  let originalOffset = 0
  const originalStarts: number[] = []
  const originalEnds: number[] = []
  for (const character of value) {
    const folded = character.toLocaleLowerCase()
    const end = originalOffset + character.length
    text += folded
    for (let index = 0; index < folded.length; index += 1) {
      originalStarts.push(originalOffset)
      originalEnds.push(end)
    }
    originalOffset = end
  }
  return { text, originalStarts, originalEnds }
}

/** Find every non-overlapping text occurrence on one side of a complete diff file. */
export function findDiffMatches(
  file: DiffFile,
  side: DiffSide,
  query: string,
  matchCase = false,
): readonly DiffSearchMatch[] {
  if (query === '') return []
  const needle = matchCase ? query : foldCase(query).text
  const matches: DiffSearchMatch[] = []
  for (const row of file.rows) {
    const line = side === 'before' ? row.left : row.right
    if (line.lineNumber === null) continue
    const folded = matchCase ? null : foldCase(line.text)
    const haystack = folded?.text ?? line.text
    let searchOffset = 0
    while (searchOffset <= haystack.length - needle.length) {
      const found = haystack.indexOf(needle, searchOffset)
      if (found === -1) break
      const startColumn = folded?.originalStarts[found] ?? found
      const endColumn = folded?.originalEnds[found + needle.length - 1] ?? found + needle.length
      matches.push({ rowIndex: row.index, lineNumber: line.lineNumber, startColumn, endColumn })
      searchOffset = found + Math.max(1, needle.length)
    }
  }
  return matches
}

/** Return plain source text for an inclusive diff-row range on one side. */
export function diffRangeText(file: DiffFile, side: DiffSide, startRow: number, endRow: number): string {
  const first = Math.max(0, Math.min(startRow, endRow))
  const last = Math.min(file.rows.length - 1, Math.max(startRow, endRow))
  return file.rows
    .slice(first, last + 1)
    .map(row => side === 'before' ? row.left : row.right)
    .filter(line => line.lineNumber !== null)
    .map(line => line.text)
    .join('\n')
}
