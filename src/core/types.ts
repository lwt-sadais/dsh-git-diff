export type ChangeKind = 'equal' | 'delete' | 'insert' | 'modify' | 'empty'

export interface DiffLine {
  readonly kind: ChangeKind
  readonly text: string
  readonly lineNumber: number | null
  readonly partnerKind?: 'delete' | 'insert'
}

export interface DiffRow {
  readonly index: number
  readonly left: DiffLine
  readonly right: DiffLine
  readonly changed: boolean
}

export interface ChangeMarker {
  readonly row: number
  readonly kind: 'delete' | 'insert'
}

export interface DiffFile {
  /** Path relative to the top-level workspace (globally unique in this snapshot). */
  readonly path: string
  /** Path relative to the repository that owns this file. */
  readonly repositoryRelativePath: string
  /** Owning repository path relative to the top-level workspace; empty for root. */
  readonly repositoryPath: string
  readonly oldPath: string | null
  readonly status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked'
  readonly binary: boolean
  readonly truncated: boolean
  readonly before: string
  readonly after: string
  readonly rows: readonly DiffRow[]
  readonly markers: readonly ChangeMarker[]
}

export interface DiffRepository {
  /** Repository path relative to the top-level workspace; empty for root. */
  readonly path: string
  readonly name: string
  readonly initialized: boolean
  /** The parent repository records a changed gitlink commit for this submodule. */
  readonly headChanged: boolean
  readonly files: readonly DiffFile[]
  readonly children: readonly DiffRepository[]
}

export interface DiffResponse {
  readonly root: string
  readonly generatedAt: string
  /** Flat compatibility/index list, including files from every initialized repository. */
  readonly files: readonly DiffFile[]
  /** Root repository and recursively nested submodule repositories. */
  readonly repository: DiffRepository
}

export interface ApiError {
  readonly code: 'workspace-unknown' | 'not-git-repository' | 'too-large' | 'invalid-request' | 'internal'
  readonly message: string
}

export type ApiResult<T> =
  | { readonly ok: true, readonly value: T }
  | { readonly ok: false, readonly error: ApiError }

export interface ReviewAnnotation {
  readonly id: string
  readonly path: string
  readonly side: 'before' | 'after'
  readonly startLine: number
  readonly endLine: number
  readonly content: string
  readonly comment: string
}
