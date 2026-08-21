export type ChangeKind = 'equal' | 'delete' | 'insert' | 'modify' | 'empty';
export interface DiffLine {
    readonly kind: ChangeKind;
    readonly text: string;
    readonly lineNumber: number | null;
    readonly partnerKind?: 'delete' | 'insert';
}
export interface DiffRow {
    readonly index: number;
    readonly left: DiffLine;
    readonly right: DiffLine;
    readonly changed: boolean;
}
export interface ChangeMarker {
    readonly row: number;
    readonly kind: 'delete' | 'insert';
}
export interface DiffFileSummary {
    readonly id: string;
    /** Path relative to the top-level workspace (globally unique in this manifest). */
    readonly path: string;
    readonly repositoryRelativePath: string;
    readonly repositoryPath: string;
    readonly oldPath: string | null;
    readonly status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked';
}
export interface DiffFile extends DiffFileSummary {
    readonly binary: boolean;
    readonly truncated: boolean;
    readonly before: string;
    readonly after: string;
    readonly rows: readonly DiffRow[];
    readonly markers: readonly ChangeMarker[];
}
export interface DiffRepository {
    readonly path: string;
    readonly name: string;
    readonly initialized: boolean;
    readonly headChanged: boolean;
    readonly files: readonly DiffFileSummary[];
    readonly children: readonly DiffRepository[];
}
export interface DiffResponse {
    readonly manifestId: string;
    readonly generatedAt: string;
    readonly files: readonly DiffFileSummary[];
    readonly repository: DiffRepository;
}
export interface DiffFileRequest {
    readonly path: string;
    readonly manifestId: string;
    readonly fileId: string;
}
export interface ApiError {
    readonly code: 'workspace-unknown' | 'not-git-repository' | 'manifest-stale' | 'file-unknown' | 'too-large' | 'invalid-request' | 'internal';
    readonly message: string;
}
export type ApiResult<T> = {
    readonly ok: true;
    readonly value: T;
} | {
    readonly ok: false;
    readonly error: ApiError;
};
export interface ReviewAnnotation {
    readonly id: string;
    readonly path: string;
    readonly side: 'before' | 'after';
    readonly startLine: number;
    readonly endLine: number;
    readonly content: string;
    readonly comment: string;
}
