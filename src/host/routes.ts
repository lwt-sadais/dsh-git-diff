import type { IncomingMessage, ServerResponse } from 'node:http'
import { isIP } from 'node:net'
import type { Context } from '@deepseek-ai/cordis'
import type { ApiResult, DiffResponse } from '../core/types.js'
import type { DiffService } from './diff-service.js'

const ROUTE = '/api/dsh-git-diff/snapshot'
const BODY_CAP = 8 * 1024

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

function pathOf(value: unknown): string | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (Object.keys(record).length !== 1 || typeof record.path !== 'string' || record.path.length === 0 || record.path.length > 4096) return null
  return record.path
}

function send(res: ServerResponse, status: number, result: ApiResult<DiffResponse>): void {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.setHeader('x-content-type-options', 'nosniff')
  res.end(JSON.stringify(result))
}

export function registerRoutes(ctx: Context, service: DiffService): () => void {
  return ctx.webServer.register({
    kind: 'exact',
    path: ROUTE,
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
        const path = pathOf(await readBody(req))
        if (path === null) {
          send(res, 400, { ok: false, error: { code: 'invalid-request', message: 'invalid workspace path request' } })
          return
        }
        const result = await service.snapshot(path, controller.signal)
        if (!controller.signal.aborted && !res.destroyed) send(res, result.ok ? 200 : 400, result)
      } catch (cause) {
        if (!controller.signal.aborted && !res.destroyed) {
          ctx.logger.warn(`dsh-git-diff: snapshot failed: ${String(cause)}`)
          send(res, 500, { ok: false, error: { code: 'internal', message: 'unable to build Git diff snapshot' } })
        }
      } finally {
        req.off('aborted', abort)
        res.off('close', abort)
      }
    },
  })
}
