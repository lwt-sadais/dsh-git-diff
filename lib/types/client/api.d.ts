import type { ApiResult, DiffFile, DiffFileRequest, DiffResponse } from '../core/types.js';
export declare function readDiff(path: string, signal?: AbortSignal): Promise<ApiResult<DiffResponse>>;
export declare function readDiffFile(request: DiffFileRequest, signal?: AbortSignal): Promise<ApiResult<DiffFile>>;
/** Discard one file selected from the current server-issued manifest. */
export declare function discardDiffFile(request: DiffFileRequest, signal?: AbortSignal): Promise<ApiResult<null>>;
