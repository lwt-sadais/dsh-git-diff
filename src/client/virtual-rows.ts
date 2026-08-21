export const DIFF_ROW_HEIGHT = 20
const OVERSCAN_ROWS = 20

export interface VisibleRowRange {
  readonly start: number
  readonly end: number
}

export function visibleRowRange(rowCount: number, scrollTop: number, viewportHeight: number): VisibleRowRange {
  const boundedCount = Math.max(0, rowCount)
  const visibleCount = Math.ceil(Math.max(0, viewportHeight) / DIFF_ROW_HEIGHT)
  const windowSize = visibleCount + OVERSCAN_ROWS * 2
  const requestedStart = Math.max(0, Math.floor(Math.max(0, scrollTop) / DIFF_ROW_HEIGHT) - OVERSCAN_ROWS)
  const start = Math.min(requestedStart, Math.max(0, boundedCount - windowSize))
  return { start, end: Math.min(boundedCount, start + windowSize) }
}
