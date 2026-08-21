import type { ApiResult, DiffFile, DiffFileRequest, DiffResponse } from '../core/types.js'

const FALLBACK: ApiResult<never> = { ok: false, error: { code: 'internal', message: 'Git diff service is unavailable' } }

async function post<T>(route: string, body: unknown, signal?: AbortSignal): Promise<ApiResult<T>> {
  try {
    const response = await fetch(route, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      ...(signal === undefined ? {} : { signal }),
    })
    const value = await response.json() as unknown
    if (value !== null && typeof value === 'object' && 'ok' in value) return value as ApiResult<T>
    return FALLBACK
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    return FALLBACK
  }
}

export function readDiff(path: string, signal?: AbortSignal): Promise<ApiResult<DiffResponse>> {
  return post('/api/dsh-git-diff/snapshot', { path }, signal)
}

export function readDiffFile(request: DiffFileRequest, signal?: AbortSignal): Promise<ApiResult<DiffFile>> {
  return post('/api/dsh-git-diff/file', request, signal)
}
