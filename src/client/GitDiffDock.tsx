import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconCodeOutline16, Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { DiffFile, DiffLine, DiffRepository, ReviewAnnotation } from '../core/types.js'
import type { GitDiffLocaleKey } from './locales.js'
import { readDiff } from './api.js'

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
            <span className="dgdStatus">{t(STATUS_KEYS[file.status])}</span>
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

function SelectedFileHeader({ file, t }: { file: DiffFile, t: GitDiffDockProps['t'] }) {
  return (
    <div className="dgdSelectedFile" title={file.path}>
      <span className="dgdSelectedFileIcon" aria-hidden="true">‹/›</span>
      {file.oldPath !== null && <><span className="dgdSelectedFileRename">{file.oldPath}</span><span aria-hidden="true">→</span></>}
      <span className="dgdSelectedFilePath">{file.path}</span>
      <span className="dgdStatus">{t(STATUS_KEYS[file.status])}</span>
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
  return (
    <div ref={paneRef} className="dgdPane" onScroll={onScroll} onMouseUp={onSelect} data-side={side}>
      <div className="dgdRows">
        {file.rows.map(row => {
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
  const [files, setFiles] = useState<readonly DiffFile[]>([])
  const [repository, setRepository] = useState<DiffRepository | null>(null)
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
  const [activePath, setActivePath] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectedCode | null>(null)
  const [comment, setComment] = useState('')
  const [annotations, setAnnotations] = useState<readonly ReviewAnnotation[]>([])
  const [sent, setSent] = useState(false)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const syncing = useRef(false)
  const activeFile = useMemo(() => files.find(file => file.path === activePath) ?? files[0], [activePath, files])

  const load = useCallback(async (signal?: AbortSignal) => {
    if (cwd === undefined || cwd === '') { setError(t('noWorkspace')); return }
    setLoading(true)
    setError(null)
    const result = await readDiff(cwd, signal)
    if (!result.ok) setError(result.error.message)
    else {
      setFiles(result.value.files)
      setRepository(result.value.repository)
      setExpanded(current => current.size === 0
        ? new Set(result.value.repository.children.filter(child => countRepositoryChanges(child) > 0).map(child => child.path))
        : current)
      setActivePath(current => result.value.files.some(file => file.path === current) ? current : result.value.files[0]?.path ?? null)
    }
    setLoading(false)
  }, [cwd, t])

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    void load(controller.signal)
    return () => controller.abort()
  }, [load, open])

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
  }

  const locate = (row: number) => {
    const top = row * 20
    leftRef.current?.scrollTo({ top: Math.max(0, top - (leftRef.current.clientHeight / 2)), behavior: 'smooth' })
    rightRef.current?.scrollTo({ top: Math.max(0, top - (rightRef.current.clientHeight / 2)), behavior: 'smooth' })
  }

  return (
    <div className="dgdDock">
      <Tooltip label={t('button')} side="top" delayMs={500}>
        <button type="button" className="dgdLauncher" onClick={() => { setOpen(true); setSent(false) }} aria-label={t('button')} title={t('button')}>
          <IconCodeOutline16 size={16} />
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
            <div className="dgdBody">
              <aside className="dgdFiles">
                {repository !== null && <RepositoryTree
                  repository={repository}
                  activePath={activeFile?.path ?? null}
                  expanded={expanded}
                  onToggle={path => setExpanded(current => {
                    const next = new Set(current)
                    next.has(path) ? next.delete(path) : next.add(path)
                    return next
                  })}
                  onSelect={setActivePath}
                  t={t}
                />}
              </aside>
              <main className="dgdMain">
                {loading ? <div className="dgdCenter">{t('loading')}</div>
                  : error !== null ? <div className="dgdCenter" role="alert">{error}</div>
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
