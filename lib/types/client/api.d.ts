import type { ApiResult, DiffFile, DiffFileRequest, DiffResponse } from '../core/types.js';
export declare function readDiff(path: string, signal?: AbortSignal): Promise<ApiResult<DiffResponse>>;
export declare function readDiffFile(request: DiffFileRequest, signal?: AbortSignal): Promise<ApiResult<DiffFile>>;
