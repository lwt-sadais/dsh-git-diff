import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type GitDiffLocaleKey } from './locales.js';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'git-diff': GitDiffLocaleKey;
    }
}
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
export { GitDiffDock } from './GitDiffDock.js';
