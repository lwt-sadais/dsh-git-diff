import type { ApiResult, DiffResponse } from '../core/types.js'

const FALLBACK: ApiResult<never> = { ok: false, error: { code: 'internal', message: 'Git diff service is unavailable' } }

export async function readDiff(path: string, signal?: AbortSignal): Promise<ApiResult<DiffResponse>> {
  try {
    const response = await fetch('/api/dsh-git-diff/snapshot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path }),
      ...(signal === undefined ? {} : { signal }),
    })
    const value = await response.json() as unknown
    if (value !== null && typeof value === 'object' && 'ok' in value) return value as ApiResult<DiffResponse>
    return FALLBACK
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    return FALLBACK
  }
}
