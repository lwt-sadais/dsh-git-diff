import { describe, expect, it } from 'vitest'
import type { DiffFile, DiffRepository } from '../src/core/types.js'
import { filterRepositoryTree, fuzzyPathMatch } from '../src/client/fuzzy-path.js'

function file(path: string, repositoryPath = ''): DiffFile {
  const repositoryRelativePath = repositoryPath === '' ? path : path.slice(repositoryPath.length + 1)
  return {
    path,
    repositoryRelativePath,
    repositoryPath,
    oldPath: null,
    status: 'modified',
    binary: false,
    truncated: false,
    before: '',
    after: '',
    rows: [],
    markers: [],
  }
}

describe('fuzzyPathMatch', () => {
  it('matches ordered non-contiguous path characters', () => {
    expect(fuzzyPathMatch('/a/223/user/project/index.vue', 'a3erprovue')).toBe(true)
  })

  it('matches case-insensitively and rejects out-of-order characters', () => {
    expect(fuzzyPathMatch('Src/UserProfile.vue', 'SUPV')).toBe(true)
    expect(fuzzyPathMatch('src/project/index.vue', 'vueproject')).toBe(false)
  })
})

describe('filterRepositoryTree', () => {
  it('keeps matching files with their nested repository ancestry', () => {
    const repository: DiffRepository = {
      path: '', name: 'root', initialized: true, headChanged: false,
      files: [file('README.md')],
      children: [{
        path: 'packages/ui', name: 'ui', initialized: true, headChanged: false,
        files: [file('packages/ui/src/UserProfile.vue', 'packages/ui')], children: [],
      }],
    }
    const filtered = filterRepositoryTree(repository, 'usrprofvue')
    expect(filtered.files).toHaveLength(0)
    expect(filtered.children).toHaveLength(1)
    expect(filtered.children[0]?.files[0]?.path).toBe('packages/ui/src/UserProfile.vue')
  })
})
