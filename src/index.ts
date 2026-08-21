import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-subprocess'
import type {} from '@deepseek-ai/dsh-workspace'
import { createWorkspaceGate, DiffService, subprocessRunner } from './host/diff-service.js'
import { registerRoutes } from './host/routes.js'

export const name = 'dsh-git-diff'
export const inject = ['webServer', 'subprocess', 'workspaceRegistry']

export function apply(ctx: Context): void {
  const service = new DiffService(
    subprocessRunner(ctx),
    createWorkspaceGate(() => ctx.workspaceRegistry.list()),
  )
  ctx.effect(() => registerRoutes(ctx, service), 'dsh-git-diff: snapshot route')
}

export type * from './core/types.js'
export { alignDiff, DiffService } from './host/diff-service.js'
