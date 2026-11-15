/*
 * GPC Taxonomy Management
 * =======================
 * Upload a GS1 GPC JSON file and watch it import in real time.
 * Shows live SSE progress (phase label + animated bar + %).
 * Also lists all previously imported taxonomy versions.
 */

'use client'

import * as React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import {
  Tags,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Star,
  FileJson,
  ChevronRight,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProgressEvent {
  phase: 'parse' | 'connect' | 'version' | 'insert' | 'parents' | 'cleanup' | 'done' | 'error'
  message: string
  current: number
  total: number
  pct: number
  versionId?: string
  activeNodes?: number
  deactivated?: number
  error?: string
}

interface TaxonomyVersion {
  id: string
  releaseDate: string
  label: string
  isCurrent: boolean
  nodeCount: number
  importedAt: string
}

// ── Phase display helpers ─────────────────────────────────────────────────────

const PHASE_LABELS: Record<ProgressEvent['phase'], string> = {
  parse:   'Parsing file',
  connect: 'Connecting to database',
  version: 'Recording version',
  insert:  'Inserting nodes',
  parents: 'Linking hierarchy',
  cleanup: 'Cleaning up old nodes',
  done:    'Complete',
  error:   'Failed',
}

const PHASE_ORDER: ProgressEvent['phase'][] = [
  'parse', 'connect', 'version', 'insert', 'parents', 'cleanup', 'done',
]

// ── Progress bar colours ──────────────────────────────────────────────────────

function barColour(phase: ProgressEvent['phase']): string {
  if (phase === 'done')  return 'bg-green-500'
  if (phase === 'error') return 'bg-red-500'
  return 'bg-primary'
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TaxonomyPage() {
  const [file, setFile]               = React.useState<File | null>(null)
  const [dragging, setDragging]       = React.useState(false)
  const [importing, setImporting]     = React.useState(false)
  const [progress, setProgress]       = React.useState<ProgressEvent | null>(null)
  const [log, setLog]                 = React.useState<ProgressEvent[]>([])
  const [versions, setVersions]       = React.useState<TaxonomyVersion[]>([])
  const [loadingVersions, setLoadingVersions] = React.useState(true)
  const [settingCurrent, setSettingCurrent]   = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const logEndRef    = React.useRef<HTMLDivElement>(null)

  // ── Load version history ──────────────────────────────────────────────────
  const loadVersions = React.useCallback(async () => {
    setLoadingVersions(true)
    try {
      const { data } = await apiClient.get<TaxonomyVersion[]>('/gpc/versions')
      setVersions(Array.isArray(data) ? data : [])
    } catch {
      setVersions([])
    } finally {
      setLoadingVersions(false)
    }
  }, [])

  React.useEffect(() => { loadVersions() }, [loadVersions])

  // Auto-scroll log
  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setProgress(null)
    setLog([])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && (f.type === 'application/json' || f.name.endsWith('.json'))) {
      setFile(f)
      setProgress(null)
      setLog([])
    }
  }

  // ── Import via fetch + SSE ────────────────────────────────────────────────
  const handleImport = async () => {
    if (!file || importing) return
    setImporting(true)
    setProgress(null)
    setLog([])

    const form = new FormData()
    form.append('file', file)

    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem('access_token')
      : null

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/gpc/import`,
        {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        },
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      // Parse the SSE stream line by line
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // SSE frames are separated by double newlines
        const frames = buffer.split('\n\n')
        buffer = frames.pop() ?? '' // keep any incomplete frame

        for (const frame of frames) {
          const dataLine = frame.split('\n').find(l => l.startsWith('data:'))
          if (!dataLine) continue
          try {
            const event: ProgressEvent = JSON.parse(dataLine.slice(5).trim())
            setProgress(event)
            setLog(prev => [...prev, event])
            if (event.phase === 'done' || event.phase === 'error') break
          } catch { /* ignore malformed frame */ }
        }
      }
    } catch (err: any) {
      const errEvent: ProgressEvent = {
        phase: 'error', message: err.message ?? 'Upload failed',
        current: 0, total: 0, pct: 0, error: err.message,
      }
      setProgress(errEvent)
      setLog(prev => [...prev, errEvent])
    } finally {
      setImporting(false)
      loadVersions()
    }
  }

  // ── Promote a past version to current ────────────────────────────────────
  const handleSetCurrent = async (id: string) => {
    setSettingCurrent(id)
    try {
      await apiClient.post(`/gpc/versions/${id}/set-current`)
      await loadVersions()
    } finally {
      setSettingCurrent(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const isDone  = progress?.phase === 'done'
  const isError = progress?.phase === 'error'

  return (
    <MainLayout>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">GPC Taxonomy</h1>
          <p className="text-sm text-muted-foreground">
            Import GS1 Global Product Classification releases and manage taxonomy versions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadVersions} disabled={loadingVersions}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loadingVersions ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── Left: upload + progress ── */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload GPC Release
              </CardTitle>
              <CardDescription>
                Upload the official GS1 GPC JSON file (e.g.{' '}
                <span className="font-mono text-xs">GPC as of May 2026 … EN.json</span>).
                Only levels 1–4 (Segment → Brick) are imported.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Drop zone */}
              <div
                className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer
                  ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileJson className={`h-10 w-10 ${file ? 'text-primary' : 'text-muted-foreground'}`} />
                {file ? (
                  <div className="text-center">
                    <p className="font-medium text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(file.size / 1024 / 1024).toFixed(1)} MB · Click to change
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop GPC JSON here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleImport}
                disabled={!file || importing}
              >
                {importing ? (
                  <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Importing…</>
                ) : (
                  <><Upload className="mr-2 h-4 w-4" />Start Import</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Progress card — only shown once import starts */}
          {progress && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {isDone  && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  {isError && <XCircle      className="h-5 w-5 text-red-500"   />}
                  {!isDone && !isError && (
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {isDone ? 'Import complete' : isError ? 'Import failed' : 'Importing…'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">

                {/* Phase steps */}
                <div className="space-y-1.5">
                  {PHASE_ORDER.map((phase) => {
                    const idx        = PHASE_ORDER.indexOf(phase)
                    const curIdx     = PHASE_ORDER.indexOf(progress.phase === 'error' ? 'done' : progress.phase)
                    const isComplete = idx < curIdx || progress.phase === 'done'
                    const isActive   = phase === progress.phase && !isError
                    return (
                      <div key={phase} className="flex items-center gap-2 text-xs">
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 transition-colors
                          ${isComplete ? 'bg-green-500' : isActive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`}
                        />
                        <span className={isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'}>
                          {PHASE_LABELS[phase]}
                        </span>
                      </div>
                    )
                  })}
                  {isError && (
                    <div className="flex items-center gap-2 text-xs text-red-500">
                      <XCircle className="h-3 w-3" /> {progress.error}
                    </div>
                  )}
                </div>

                {/* Big progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground truncate">{progress.message}</span>
                    <span className="font-mono font-medium tabular-nums flex-shrink-0 ml-2">{progress.pct}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ease-out ${barColour(progress.phase)}`}
                      style={{ width: `${progress.pct}%` }}
                    />
                  </div>
                </div>

                {/* Final summary */}
                {isDone && (
                  <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm space-y-1">
                    <p className="font-medium text-green-700 dark:text-green-400">
                      {progress.activeNodes?.toLocaleString()} active nodes imported
                    </p>
                    {(progress.deactivated ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {progress.deactivated} nodes from previous releases soft-deactivated
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground font-mono">
                      Version ID: {progress.versionId}
                    </p>
                  </div>
                )}

                {/* Scrollable log */}
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Show log ({log.length} events)
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto rounded bg-muted p-2 font-mono space-y-0.5">
                    {log.map((e, i) => (
                      <div key={i} className={e.phase === 'error' ? 'text-red-500' : ''}>
                        [{e.pct.toString().padStart(3)}%] {e.message}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </details>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: version history ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription>
              All imported GPC releases. The <strong>Current</strong> release is what sellers see when
              classifying products. You can roll back to a previous release if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingVersions ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Tags className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No versions imported yet</p>
                <p className="text-xs text-muted-foreground">Upload a GPC JSON file to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm truncate">{v.label}</span>
                        {v.isCurrent && (
                          <Badge variant="default" className="text-xs flex-shrink-0">
                            <Star className="mr-1 h-2.5 w-2.5" />
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span>{v.nodeCount.toLocaleString()} nodes</span>
                        <span>·</span>
                        <span>Imported {new Date(v.importedAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    {!v.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={settingCurrent === v.id}
                        onClick={() => handleSetCurrent(v.id)}
                        title="Promote this release to current"
                      >
                        {settingCurrent === v.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <ChevronRight className="mr-1 h-3.5 w-3.5" />
                            Set current
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* ── Info callout ── */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-semibold">Versioning policy</p>
          <p>Importing a new release never deletes old nodes — products that referenced them keep their links. Nodes removed from the new release are soft-deactivated (hidden from sellers) but remain in the database. You can always roll back by clicking <em>Set current</em> on a previous version.</p>
        </div>
      </div>
    </MainLayout>
  )
}
