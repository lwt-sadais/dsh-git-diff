import type { ApiResult, DiffResponse } from '../core/types.js';
export declare function readDiff(path: string, signal?: AbortSignal): Promise<ApiResult<DiffResponse>>;
