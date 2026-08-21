import type { DiffRepository } from '../core/types.js'

/** Case-insensitive subsequence match: every query character must appear in order. */
export function fuzzyPathMatch(path: string, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase()
  if (needle === '') return true
  const haystack = path.toLocaleLowerCase()
  let offset = 0
  for (const character of needle) {
    offset = haystack.indexOf(character, offset)
    if (offset < 0) return false
    offset += character.length
  }
  return true
}

/** Preserve repository ancestry while retaining only files matching the query. */
export function filterRepositoryTree(repository: DiffRepository, query: string): DiffRepository {
  if (query.trim() === '') return repository
  const files = repository.files.filter(file => fuzzyPathMatch(file.path, query))
  const children = repository.children
    .map(child => filterRepositoryTree(child, query))
    .filter(child => child.files.length > 0 || child.children.length > 0)
  return { ...repository, files, children }
}
