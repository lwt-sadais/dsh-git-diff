import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { GitDiffDock } from './GitDiffDock.js'
import { en, zh, type GitDiffLocaleKey } from './locales.js'
import styles from './styles.css?inline'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'git-diff': GitDiffLocaleKey
  }
}

export const inject = ['slots', 'locale']
const NS = 'git-diff'

export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.dshGitDiff = ''
    style.textContent = styles
    document.head.appendChild(style)
    return () => style.remove()
  }, 'dsh-git-diff: styles')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-git-diff: dictionaries')
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'git-diff',
    // dsh-file-upload registers upload at 0 and microphone at 1. Order 2
    // places Git Diff immediately to the microphone's right.
    order: 2,
    locale: NS,
  }, GitDiffDock))
}

export { GitDiffDock } from './GitDiffDock.js'
