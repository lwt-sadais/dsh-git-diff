import type { DiffRepository } from '../core/types.js';
/** Case-insensitive subsequence match: every query character must appear in order. */
export declare function fuzzyPathMatch(path: string, query: string): boolean;
/** Preserve repository ancestry while retaining only files matching the query. */
export declare function filterRepositoryTree(repository: DiffRepository, query: string): DiffRepository;
