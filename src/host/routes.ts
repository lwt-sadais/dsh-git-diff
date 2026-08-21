import type { IncomingMessage, ServerResponse } from 'node:http'
import { isIP } from 'node:net'
import type { Context } from '@deepseek-ai/cordis'
import type { ApiResult, DiffFile, DiffFileRequest, DiffResponse } from '../core/types.js'
import type { DiffService } from './diff-service.js'

const SNAPSHOT_ROUTE = '/api/dsh-git-diff/snapshot'
const FILE_ROUTE = '/api/dsh-git-diff/file'
const BODY_CAP = 16 * 1024

function allowed(req: IncomingMessage): boolean {
  const address = req.socket.remoteAddress?.replace(/^::ffff:/u, '')
  if (address === undefined || (address !== '::1' && !(isIP(address) === 4 && address.startsWith('127.')))) return false
  const contentType = req.headers['content-type']
  if (typeof contentType !== 'string' || !contentType.toLowerCase().startsWith('application/json')) return false
  const origin = req.headers.origin
  const host = req.headers.host
  return typeof origin === 'string' && typeof host === 'string' && origin === `http://${host}`
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let bytes = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    bytes += buffer.byteLength
    if (bytes > BODY_CAP) throw new Error('body too large')
    chunks.push(buffer)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

function recordOf(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function boundedString(value: unknown, allowEmpty = false): string | null {
  return typeof value === 'string' && value.length <= 4096 && (allowEmpty || value.length > 0) ? value : null
}

function pathOf(value: unknown): string | null {
  const record = recordOf(value)
  if (record === null || Object.keys(record).length !== 1) return null
  return boundedString(record.path)
}

function fileRequestOf(value: unknown): DiffFileRequest | null {
  const record = recordOf(value)
  if (record === null || Object.keys(record).length !== 3) return null
  const path = boundedString(record.path)
  const manifestId = boundedString(record.manifestId)
  const fileId = boundedString(record.fileId)
  return path === null || manifestId === null || fileId === null
    ? null : { path, manifestId, fileId }
}

function send<T>(res: ServerResponse, status: number, result: ApiResult<T>): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(JSON.stringify(result))
}

function registerRoute<T>(ctx: Context, route: string, parse: (value: unknown) => T | null, run: (value: T, signal: AbortSignal) => Promise<ApiResult<DiffResponse | DiffFile>>): () => void {
  return ctx.webServer.register({
    kind: 'exact',
    path: route,
    handler: async (req, res) => {
      if (req.method !== 'POST' || !allowed(req)) {
        send(res, 403, { ok: false, error: { code: 'invalid-request', message: 'local same-origin JSON POST required' } })
        return
      }
      const controller = new AbortController()
      const abort = () => controller.abort()
      req.once('aborted', abort)
      res.once('close', abort)
      try {
        const value = parse(await readBody(req))
        if (value === null) {
          send(res, 400, { ok: false, error: { code: 'invalid-request', message: 'invalid Git diff request' } })
          return
        }
        const result = await run(value, controller.signal)
        if (!controller.signal.aborted && !res.destroyed) send(res, result.ok ? 200 : 400, result)
      } catch (cause) {
        if (!controller.signal.aborted && !res.destroyed) {
          ctx.logger.warn(`dsh-git-diff: request failed: ${String(cause)}`)
          send(res, 500, { ok: false, error: { code: 'internal', message: 'unable to build Git diff response' } })
        }
      } finally {
        req.off('aborted', abort)
        res.off('close', abort)
      }
    },
  })
}

export function registerRoutes(ctx: Context, service: DiffService): () => void {
  const disposeSnapshot = registerRoute(ctx, SNAPSHOT_ROUTE, pathOf, (path, signal) => service.snapshot(path, signal))
  const disposeFile = registerRoute(ctx, FILE_ROUTE, fileRequestOf, (request, signal) => service.file(request, signal))
  return () => { disposeFile(); disposeSnapshot() }
}
