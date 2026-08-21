import { describe, expect, it } from 'vitest'
import { DIFF_ROW_HEIGHT, visibleRowRange } from '../src/client/virtual-rows.js'

describe('visibleRowRange', () => {
  it('renders only a bounded initial window for a large file', () => {
    expect(visibleRowRange(10_000, 0, 800)).toEqual({ start: 0, end: 80 })
  })

  it('moves the window with scroll position and retains overscan', () => {
    expect(visibleRowRange(10_000, 5_000 * DIFF_ROW_HEIGHT, 800)).toEqual({ start: 4_980, end: 5_060 })
  })

  it('clamps the final window to the available rows', () => {
    expect(visibleRowRange(25, 10_000, 800)).toEqual({ start: 0, end: 25 })
  })
})
