export declare const DIFF_ROW_HEIGHT = 20;
export interface VisibleRowRange {
    readonly start: number;
    readonly end: number;
}
export declare function visibleRowRange(rowCount: number, scrollTop: number, viewportHeight: number): VisibleRowRange;
