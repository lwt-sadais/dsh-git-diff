import type { DiffFile } from '../core/types.js';
export type DiffSide = 'before' | 'after';
export interface DiffSearchMatch {
    readonly rowIndex: number;
    readonly lineNumber: number;
    readonly startColumn: number;
    readonly endColumn: number;
}
/** Find every non-overlapping text occurrence on one side of a complete diff file. */
export declare function findDiffMatches(file: DiffFile, side: DiffSide, query: string, matchCase?: boolean): readonly DiffSearchMatch[];
/** Return plain source text for an inclusive diff-row range on one side. */
export declare function diffRangeText(file: DiffFile, side: DiffSide, startRow: number, endRow: number): string;
