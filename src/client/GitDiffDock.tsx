import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { gitDiffToolbarIcon } from './assets/git-diff-toolbar.js'
import type { DiffFile, DiffFileSummary, DiffLine, DiffRepository, ReviewAnnotation } from '../core/types.js'
import type { GitDiffLocaleKey } from './locales.js'
import { readDiff, readDiffFile } from './api.js'
import { filterRepositoryTree, fuzzyPathMatch } from './fuzzy-path.js'
import { DIFF_ROW_HEIGHT, visibleRowRange } from './virtual-rows.js'

export type GitDiffDockProps = PropsRuntime<'conversation.input.left'> & PropsLocale<'git-diff'>

interface SelectedCode {
  readonly path: string
  readonly side: 'before' | 'after'
  readonly startLine: number
  readonly endLine: number
  readonly content: string
}

const STATUS_KEYS: Record<DiffFile['status'], GitDiffLocaleKey> = {
  modified: 'statusModified', added: 'statusAdded', deleted: 'statusDeleted', renamed: 'statusRenamed', untracked: 'statusUntracked',
}

function statusClass(status: DiffFile['status']): string {
  return `dgdStatus dgdStatus${status[0]!.toUpperCase()}${status.slice(1)}`
}

function lineClass(line: DiffLine): string {
  if (line.kind === 'delete') return 'dgdDelete'
  if (line.kind === 'insert') return 'dgdInsert'
  if (line.kind === 'modify') return line.partnerKind === 'delete' ? 'dgdModifyDelete' : 'dgdModifyInsert'
  if (line.kind === 'empty') return 'dgdEmpty'
  return 'dgdEqual'
}

function RepositoryTree({ repository, activePath, expanded, onToggle, onSelect, t, depth = 0 }: {
  repository: DiffRepository
  activePath: string | null
  expanded: ReadonlySet<string>
  onToggle: (path: string) => void
  onSelect: (path: string) => void
  t: GitDiffDockProps['t']
  depth?: number
}) {
  const root = repository.path === ''
  const open = root || expanded.has(repository.path)
  const changedCount = countRepositoryChanges(repository)
  return (
    <div className="dgdTreeNode">
      {!root && <button
        className="dgdRepository"
        type="button"
        onClick={() => onToggle(repository.path)}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
        title={repository.path}
        aria-expanded={open}
      >
        <span className="dgdChevron" aria-hidden="true">{open ? '⌄' : '›'}</span>
        <span aria-hidden="true">▣</span>
        <span className="dgdRepositoryName">{repository.name}</span>
        {!repository.initialized && <span className="dgdSubmoduleState">未初始化</span>}
        {repository.headChanged && <span className="dgdSubmoduleState">指针变动</span>}
        <span className="dgdTreeCount">{changedCount}</span>
      </button>}
      {open && <div>
        {repository.files.map(file => (
          <button
            className={`dgdFile ${file.path === activePath ? 'dgdFileActive' : ''}`}
            type="button"
            key={file.path}
            onClick={() => onSelect(file.path)}
            title={file.path}
            style={{ paddingLeft: `${10 + (root ? 0 : depth + 1) * 14}px` }}
          >
            <span className={statusClass(file.status)}>{t(STATUS_KEYS[file.status])}</span>
            <span className="dgdPath">{file.repositoryRelativePath}</span>
          </button>
        ))}
        {repository.children.map(child => <RepositoryTree
          key={child.path}
          repository={child}
          activePath={activePath}
          expanded={expanded}
          onToggle={onToggle}
          onSelect={onSelect}
          t={t}
          depth={root ? 0 : depth + 1}
        />)}
      </div>}
    </div>
  )
}

function countRepositoryChanges(repository: DiffRepository): number {
  return repository.files.length
    + (repository.headChanged ? 1 : 0)
    + repository.children.reduce((sum, child) => sum + countRepositoryChanges(child), 0)
}

function allRepositoryPaths(repository: DiffRepository): ReadonlySet<string> {
  const paths = new Set<string>()
  const visit = (node: DiffRepository) => {
    if (node.path !== '') paths.add(node.path)
    for (const child of node.children) visit(child)
  }
  visit(repository)
  return paths
}

function SelectedFileHeader({ file, t }: { file: DiffFileSummary, t: GitDiffDockProps['t'] }) {
  return (
    <div className="dgdSelectedFile" title={file.path}>
      <span className="dgdSelectedFileIcon" aria-hidden="true">‹/›</span>
      {file.oldPath !== null && <><span className="dgdSelectedFileRename">{file.oldPath}</span><span aria-hidden="true">→</span></>}
      <span className="dgdSelectedFilePath">{file.path}</span>
      <span className={statusClass(file.status)}>{t(STATUS_KEYS[file.status])}</span>
    </div>
  )
}

function DiffPane({ file, side, paneRef, onScroll, onSelect }: {
  file: DiffFile
  side: 'before' | 'after'
  paneRef: React.RefObject<HTMLDivElement>
  onScroll: () => void
  onSelect: () => void
}) {
  const [viewport, setViewport] = useState({ scrollTop: 0, height: 0 })
  const range = visibleRowRange(file.rows.length, viewport.scrollTop, viewport.height)
  const visibleRows = file.rows.slice(range.start, range.end)
  const handleScroll = () => {
    const pane = paneRef.current
    if (pane !== null) setViewport({ scrollTop: pane.scrollTop, height: pane.clientHeight })
    onScroll()
  }
  useEffect(() => {
    const pane = paneRef.current
    if (pane === null) return
    const update = () => setViewport({ scrollTop: pane.scrollTop, height: pane.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(pane)
    return () => observer.disconnect()
  }, [file.path, paneRef])
  return (
    <div ref={paneRef} className="dgdPane" onScroll={handleScroll} onMouseUp={onSelect} data-side={side}>
      <div className="dgdRows" style={{ height: `${file.rows.length * DIFF_ROW_HEIGHT}px`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: `${range.start * DIFF_ROW_HEIGHT}px 0 auto 0` }}>
          {visibleRows.map(row => {
            const value = side === 'before' ? row.left : row.right
            return (
              <div className={`dgdLine ${lineClass(value)}`} key={row.index} data-row={row.index} data-line={value.lineNumber ?? ''}>
                <span className="dgdLineNo">{value.lineNumber ?? ''}</span>
                <span className="dgdCode">{value.text || ' '}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatReview(annotations: readonly ReviewAnnotation[]): string {
  const groups = new Map<string, ReviewAnnotation[]>()
  for (const annotation of annotations) groups.set(annotation.path, [...(groups.get(annotation.path) ?? []), annotation])
  const lines = ['## Git Diff 批注', '']
  for (const [path, notes] of groups) {
    lines.push(`### \`${path}\``, '')
    for (const note of notes) {
      const range = note.startLine === note.endLine ? `L${note.startLine}` : `L${note.startLine}-L${note.endLine}`
      lines.push(`- **${note.side === 'before' ? '修改前' : '修改后'} ${range}**：${note.comment}`, '', '```', note.content, '```', '')
    }
  }
  return lines.join('\n').trim()
}

function selectedCode(file: DiffFile, side: 'before' | 'after', pane: HTMLDivElement): SelectedCode | null {
  const selection = window.getSelection()
  if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null
  const range = selection.getRangeAt(0)
  const startElement = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer as Element : range.startContainer.parentElement
  const endElement = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer as Element : range.endContainer.parentElement
  const startRow = startElement?.closest<HTMLElement>('.dgdLine')
  const endRow = endElement?.closest<HTMLElement>('.dgdLine')
  if (startRow === null || startRow === undefined || endRow === null || endRow === undefined || !pane.contains(startRow) || !pane.contains(endRow)) return null
  const first = Math.min(Number(startRow.dataset.row), Number(endRow.dataset.row))
  const last = Math.max(Number(startRow.dataset.row), Number(endRow.dataset.row))
  const values = file.rows.slice(first, last + 1).map(row => side === 'before' ? row.left : row.right).filter(line => line.lineNumber !== null)
  if (values.length === 0) return null
  return {
    path: file.path,
    side,
    startLine: values[0]!.lineNumber!,
    endLine: values.at(-1)!.lineNumber!,
    content: values.map(value => value.text).join('\n'),
  }
}

export function GitDiffDock(props: GitDiffDockProps) {
  const { sessionId, useSessions, useInput, inputActions, t } = props
  const cwd = useSessions(state => sessionId === undefined ? undefined : state.byId[sessionId]?.cwd)
  const draft = useInput(state => state.draft)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<readonly DiffFileSummary[]>([])
  const [repository, setRepository] = useState<DiffRepository | null>(null)
  const [manifestId, setManifestId] = useState<string | null>(null)
  const [fileDetails, setFileDetails] = useState<ReadonlyMap<string, DiffFile>>(new Map())
  const [fileLoading, setFileLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
  const [activePath, setActivePath] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectedCode | null>(null)
  const [comment, setComment] = useState('')
  const [annotations, setAnnotations] = useState<readonly ReviewAnnotation[]>([])
  const [sent, setSent] = useState(false)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)
  const loadController = useRef<AbortController | null>(null)
  const loadRequestId = useRef(0)
  const fileController = useRef<AbortController | null>(null)
  const fileRequestId = useRef(0)
  const filteredRepository = useMemo(() => repository === null ? null : filterRepositoryTree(repository, query), [query, repository])
  const filteredPaths = useMemo(() => new Set(
    query.trim() === '' ? files.map(file => file.path) : files.filter(file => fuzzyPathMatch(file.path, query)).map(file => file.path),
  ), [files, query])
  const activeSummary = useMemo(() => {
    const current = files.find(file => file.path === activePath && filteredPaths.has(file.path))
    return current ?? files.find(file => filteredPaths.has(file.path))
  }, [activePath, files, filteredPaths])
  const activeFile = activeSummary === undefined ? undefined : fileDetails.get(activeSummary.id)

  const load = useCallback(async () => {
    if (cwd === undefined || cwd === '') { setError(t('noWorkspace')); return }
    loadController.current?.abort()
    const controller = new AbortController()
    loadController.current = controller
    const requestId = ++loadRequestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await readDiff(cwd, controller.signal)
      if (requestId !== loadRequestId.current) return
      if (!result.ok) setError(result.error.message)
      else {
        setFiles(result.value.files)
        setRepository(result.value.repository)
        setManifestId(result.value.manifestId)
        setFileDetails(new Map())
        setFileError(null)
        setExpanded(current => current.size === 0
          ? new Set(result.value.repository.children.filter(child => countRepositoryChanges(child) > 0).map(child => child.path))
          : current)
        setActivePath(current => result.value.files.some(file => file.path === current) ? current : result.value.files[0]?.path ?? null)
      }
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError') && requestId === loadRequestId.current) {
        setError(cause instanceof Error ? cause.message : 'Git diff service is unavailable')
      }
    } finally {
      if (requestId === loadRequestId.current) {
        loadController.current = null
        setLoading(false)
      }
    }
  }, [cwd, t])

  useEffect(() => {
    if (!open) {
      loadController.current?.abort()
      loadController.current = null
      loadRequestId.current += 1
      setLoading(false)
      return
    }
    void load()
    return () => {
      loadController.current?.abort()
      loadController.current = null
      loadRequestId.current += 1
    }
  }, [load, open])

  useEffect(() => {
    if (!open || cwd === undefined || cwd === '' || manifestId === null || activeSummary === undefined || fileDetails.has(activeSummary.id)) return
    fileController.current?.abort()
    const controller = new AbortController()
    fileController.current = controller
    const requestId = ++fileRequestId.current
    setFileLoading(true)
    setFileError(null)
    void readDiffFile({
      path: cwd,
      manifestId,
      fileId: activeSummary.id,
    }, controller.signal).then(result => {
      if (requestId !== fileRequestId.current) return
      if (!result.ok) setFileError(result.error.message)
      else setFileDetails(current => new Map(current).set(result.value.id, result.value))
    }).catch(cause => {
      if (!(cause instanceof DOMException && cause.name === 'AbortError') && requestId === fileRequestId.current) {
        setFileError(cause instanceof Error ? cause.message : 'Git diff service is unavailable')
      }
    }).finally(() => {
      if (requestId === fileRequestId.current) {
        fileController.current = null
        setFileLoading(false)
      }
    })
    return () => {
      controller.abort()
      if (requestId === fileRequestId.current) {
        fileController.current = null
        fileRequestId.current += 1
        setFileLoading(false)
      }
    }
  }, [activeSummary, cwd, fileDetails, manifestId, open])

  useEffect(() => {
    if (!open) return
    const keydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      selection === null ? setOpen(false) : setSelection(null)
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [open, selection])

  useEffect(() => {
    setSelection(null)
    setComment('')
    if (leftRef.current) { leftRef.current.scrollTop = 0; leftRef.current.scrollLeft = 0 }
    if (rightRef.current) { rightRef.current.scrollTop = 0; rightRef.current.scrollLeft = 0 }
  }, [activeFile?.path])

  const sync = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
    if (source === null || target === null || syncing.current) return
    syncing.current = true
    target.scrollTop = source.scrollTop
    target.scrollLeft = source.scrollLeft
    requestAnimationFrame(() => { syncing.current = false })
  }

  const captureSelection = (side: 'before' | 'after') => {
    if (activeFile === undefined) return
    const pane = side === 'before' ? leftRef.current : rightRef.current
    if (pane === null) return
    const next = selectedCode(activeFile, side, pane)
    if (next !== null) { setSelection(next); setComment(''); setSent(false) }
  }

  const saveAnnotation = () => {
    const text = comment.trim()
    if (selection === null || text === '') return
    setAnnotations(current => [...current, { ...selection, id: crypto.randomUUID(), comment: text }])
    setSelection(null)
    setComment('')
    window.getSelection()?.removeAllRanges()
  }

  const sendToChat = () => {
    if (annotations.length === 0) return
    const review = formatReview(annotations)
    inputActions.setDraft(draft.trim() === '' ? review : `${draft.trimEnd()}\n\n${review}`)
    setSent(true)
    setSelection(null)
    setComment('')
    window.getSelection()?.removeAllRanges()
    setOpen(false)
  }

  const locate = (row: number) => {
    const top = row * 20
    leftRef.current?.scrollTo({ top: Math.max(0, top - (leftRef.current.clientHeight / 2)), behavior: 'smooth' })
    rightRef.current?.scrollTo({ top: Math.max(0, top - (rightRef.current.clientHeight / 2)), behavior: 'smooth' })
  }

  const beginSidebarResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = sidebarWidth
    const move = (moveEvent: PointerEvent) => setSidebarWidth(Math.min(520, Math.max(180, startWidth + moveEvent.clientX - startX)))
    const finish = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', finish)
      document.body.classList.remove('dgdResizing')
    }
    document.body.classList.add('dgdResizing')
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', finish, { once: true })
  }

  return (
    <div className="dgdDock">
      <Tooltip label={t('button')} side="top" delayMs={500}>
        <button type="button" className="dgdLauncher" onClick={() => { setOpen(true); setSent(false) }} aria-label={t('button')} title={t('button')}>
          <span
            className="dgdLauncherIcon"
            aria-hidden="true"
            style={{ '--dgd-icon-mask': `url(${gitDiffToolbarIcon})` } as React.CSSProperties}
          />
          <span className="dgdLauncherLabel">Git Diff</span>
        </button>
      </Tooltip>
      {open && createPortal(
        <div className="dgdOverlay" role="dialog" aria-modal="true" aria-label={t('title')}>
          <button className="dgdMask" type="button" onClick={() => setOpen(false)} aria-label={t('close')} />
          <section className="dgdPanel">
            <header className="dgdHeader">
              <div><h2>{t('title')}</h2><p>{t('subtitle')}</p></div>
              <div className="dgdHeaderActions">
                <button className="dgdSecondary" type="button" onClick={() => void load()} disabled={loading}>{t('refresh')}</button>
                <button className="dgdIconButton" type="button" onClick={() => setOpen(false)} aria-label={t('close')}>×</button>
              </div>
            </header>
            <div className="dgdBody" style={{ gridTemplateColumns: `${sidebarWidth}px 5px minmax(0, 1fr)` }}>
              <aside className="dgdFiles">
                <div className="dgdFileSearch">
                  <span className="dgdSearchIcon" aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder={t('searchPlaceholder')}
                    aria-label={t('searchPlaceholder')}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {query !== '' && <button type="button" onClick={() => setQuery('')} aria-label={t('clearSearch')}>×</button>}
                </div>
                {filteredRepository !== null && <RepositoryTree
                  repository={filteredRepository}
                  activePath={activeSummary?.path ?? null}
                  expanded={query.trim() === '' ? expanded : allRepositoryPaths(filteredRepository)}
                  onToggle={path => setExpanded(current => {
                    const next = new Set(current)
                    next.has(path) ? next.delete(path) : next.add(path)
                    return next
                  })}
                  onSelect={setActivePath}
                  t={t}
                />}
                {query.trim() !== '' && filteredPaths.size === 0 && <div className="dgdNoMatches">{t('noMatches')}</div>}
              </aside>
              <div className="dgdSidebarResize" role="separator" aria-orientation="vertical" aria-label={t('resizeFileList')} onPointerDown={beginSidebarResize} />
              <main className="dgdMain">
                {loading ? <div className="dgdCenter">{t('loading')}</div>
                   : error !== null ? <div className="dgdCenter" role="alert">{error}</div>
                     : activeSummary === undefined ? <div className="dgdCenter">{t('empty')}</div>
                       : fileLoading ? <><SelectedFileHeader file={activeSummary} t={t} /><div className="dgdCenter">{t('loading')}</div></>
                         : fileError !== null ? <><SelectedFileHeader file={activeSummary} t={t} /><div className="dgdCenter" role="alert">{fileError}</div></>
                           : activeFile === undefined ? <div className="dgdCenter">{t('empty')}</div>
                             : activeFile.binary ? <><SelectedFileHeader file={activeFile} t={t} /><div className="dgdCenter">{t('binary')}</div></>
                               : <>
                            <SelectedFileHeader file={activeFile} t={t} />
                            <div className="dgdColumnsHead"><span>{t('before')}</span><span>{t('after')}</span><span /></div>
                            {activeFile.truncated && <div className="dgdNotice">{t('truncated')}</div>}
                            <div className="dgdDiffViewport">
                              <DiffPane file={activeFile} side="before" paneRef={leftRef} onScroll={() => sync(leftRef.current, rightRef.current)} onSelect={() => captureSelection('before')} />
                              <DiffPane file={activeFile} side="after" paneRef={rightRef} onScroll={() => sync(rightRef.current, leftRef.current)} onSelect={() => captureSelection('after')} />
                              <div className="dgdIndicator" onClick={event => locate(Math.round((event.nativeEvent.offsetY / event.currentTarget.clientHeight) * Math.max(0, activeFile.rows.length - 1)))}>
                                {activeFile.markers.map((marker, index) => <button key={`${marker.row}-${marker.kind}-${index}`} type="button" className={`dgdMarker ${marker.kind === 'delete' ? 'dgdMarkerDelete' : 'dgdMarkerInsert'}`} style={{ top: `${(marker.row / Math.max(1, activeFile.rows.length)) * 100}%` }} onClick={event => { event.stopPropagation(); locate(marker.row) }} aria-label={`${marker.kind} ${marker.row + 1}`} />)}
                              </div>
                              {selection !== null && <div className="dgdAnnotationComposer">
                                <div className="dgdSelection">{selection.content}</div>
                                <textarea autoFocus value={comment} onChange={event => setComment(event.target.value)} placeholder={t('annotationPlaceholder')} />
                                <div className="dgdAnnotationActions"><button className="dgdSecondary" type="button" onClick={() => setSelection(null)}>{t('cancel')}</button><button className="dgdPrimary" type="button" onClick={saveAnnotation} disabled={comment.trim() === ''}>{t('saveAnnotation')}</button></div>
                              </div>}
                            </div>
                          </>}
                {annotations.length > 0 && <div className="dgdAnnotations">{annotations.map(annotation => <div className="dgdAnnotation" key={annotation.id}><span className="dgdAnnotationRef">{annotation.path}:{annotation.startLine}-{annotation.endLine}</span><span>{annotation.comment}</span><button className="dgdRemove" type="button" onClick={() => setAnnotations(current => current.filter(item => item.id !== annotation.id))}>{t('removeAnnotation')}</button></div>)}</div>}
              </main>
            </div>
            <footer className="dgdFooter">
              <span className={sent ? 'dgdToast' : ''}>{sent ? t('sentToChat') : annotations.length > 0 ? t('annotationCount', { count: annotations.length }) : t('selectionHint')}</span>
              <div className="dgdFooterActions"><span>{t('fileCount', { count: files.length })}</span><button className="dgdPrimary" type="button" disabled={annotations.length === 0} onClick={sendToChat}>{t('sendToChat')}</button></div>
            </footer>
          </section>
        </div>,
        document.body,
      )}
    </div>
  )
}
