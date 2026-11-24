/*
 * System Documentation Library
 * =============================
 * Upload, browse, and manage platform reference documents.
 * Supports PDF, Word, Excel, JSON, TXT, Markdown, CSV.
 * Files are stored in Cloudinary under /system-docs/.
 */

'use client'

import * as React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiClient } from '@/lib/api-client'
import {
  BookOpen, Upload, Trash2, ExternalLink, RefreshCw,
  FileText, FileSpreadsheet, FileJson, File,
  Search, Plus, X, Loader2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SystemDoc {
  id: string
  title: string
  fileName: string
  mimeType: string
  fileSize: number
  fileUrl: string
  category: string | null
  description: string | null
  uploadedBy: string
  createdAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fileIcon(mimeType: string): React.ReactElement {
  if (mimeType === 'application/pdf')               return <FileText      className="h-5 w-5 text-red-500"    />
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />
  if (mimeType === 'application/json')              return <FileJson      className="h-5 w-5 text-yellow-500" />
  if (mimeType.includes('word'))                    return <FileText      className="h-5 w-5 text-blue-500"   />
  return <File className="h-5 w-5 text-muted-foreground" />
}

const KNOWN_CATEGORIES = [
  'GPC Release Notes',
  'API Specification',
  'Platform Policy',
  'Developer Guide',
  'Internal Process',
  'Legal',
  'Other',
]

// ── Upload progress state ─────────────────────────────────────────────────────

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

// ── Main component ────────────────────────────────────────────────────────────

export default function SystemDocsPage() {
  // ── List state ────────────────────────────────────────────────────────────
  const [docs, setDocs]           = React.useState<SystemDoc[]>([])
  const [loading, setLoading]     = React.useState(true)
  const [filterCat, setFilterCat] = React.useState<string>('all')
  const [search, setSearch]       = React.useState('')
  const [categories, setCategories] = React.useState<string[]>([])

  // ── Upload form state ─────────────────────────────────────────────────────
  const [showUpload, setShowUpload]   = React.useState(false)
  const [uploadFile, setUploadFile]   = React.useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = React.useState('')
  const [uploadCat, setUploadCat]     = React.useState('')
  const [uploadDesc, setUploadDesc]   = React.useState('')
  const [uploadStatus, setUploadStatus] = React.useState<UploadStatus>('idle')
  const [uploadPct, setUploadPct]     = React.useState(0)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [dragging, setDragging]       = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // ── Delete state ──────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null)

  // ── Load docs + categories ────────────────────────────────────────────────
  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [docsRes, catRes] = await Promise.all([
        apiClient.get<SystemDoc[]>('/system-docs'),
        apiClient.get<string[]>('/system-docs/categories'),
      ])
      setDocs(Array.isArray(docsRes.data) ? docsRes.data : [])
      setCategories(Array.isArray(catRes.data) ? catRes.data : [])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  // ── Filtered + searched docs ──────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return docs.filter((d) => {
      const matchCat = filterCat === 'all' || d.category === filterCat
      const matchSearch = !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.fileName.toLowerCase().includes(search.toLowerCase()) ||
        (d.description ?? '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [docs, filterCat, search])

  // ── Upload with XHR for progress % ───────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !uploadTitle.trim()) return

    setUploadStatus('uploading')
    setUploadPct(0)
    setUploadError(null)

    const form = new FormData()
    form.append('file', uploadFile)
    form.append('title', uploadTitle.trim())
    if (uploadCat) form.append('category', uploadCat)
    if (uploadDesc.trim()) form.append('description', uploadDesc.trim())

    const token = typeof window !== 'undefined'
      ? sessionStorage.getItem('access_token')
      : null

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      const url = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/system-docs`

      xhr.open('POST', url)
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          // Upload progress is 0–80%; the remaining 20% is server-side processing
          setUploadPct(Math.round((evt.loaded / evt.total) * 80))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadPct(100)
          setUploadStatus('done')
          // Reset form
          setUploadFile(null)
          setUploadTitle('')
          setUploadCat('')
          setUploadDesc('')
          setShowUpload(false)
          load()
        } else {
          let msg = `Upload failed (${xhr.status})`
          try { msg = JSON.parse(xhr.responseText).message ?? msg } catch {}
          setUploadError(msg)
          setUploadStatus('error')
        }
        resolve()
      }

      xhr.onerror = () => {
        setUploadError('Network error — check your connection')
        setUploadStatus('error')
        resolve()
      }

      xhr.send(form)
    })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await apiClient.delete(`/system-docs/${id}`)
      setDocs(prev => prev.filter(d => d.id !== id))
    } finally {
      setDeletingId(null)
      setConfirmDeleteId(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout>

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">System Documentation</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage platform reference documents — release notes, specs, policies.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => { setShowUpload(true); setUploadStatus('idle'); setUploadError(null) }}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* ── Upload form (shown inline as a card) ── */}
      {showUpload && (
        <Card className="mb-6 border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Upload className="h-5 w-5" />
                Upload New Document
              </CardTitle>
              <Button
                variant="ghost" size="icon"
                onClick={() => { setShowUpload(false); setUploadFile(null); setUploadError(null) }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">

              {/* Drop zone */}
              <div
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer
                  ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragging(false)
                  const f = e.dataTransfer.files?.[0]
                  if (f) { setUploadFile(f); if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, '')) }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <>
                    {fileIcon(uploadFile.type)}
                    <span className="text-sm font-medium truncate max-w-xs">{uploadFile.name}</span>
                    <span className="text-xs text-muted-foreground">{formatBytes(uploadFile.size)} · Click to change</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Drop file here</span>
                    <span className="text-xs text-muted-foreground">PDF, Word, Excel, JSON, TXT, Markdown, CSV · max 50 MB</span>
                  </>
                )}
                <input
                  ref={fileInputRef} type="file" className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.json,.txt,.md,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setUploadFile(f); if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, '')) }
                  }}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="doc-title">Title *</Label>
                  <Input
                    id="doc-title" required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="doc-category">Category</Label>
                  <Select value={uploadCat} onValueChange={setUploadCat}>
                    <SelectTrigger id="doc-category">
                      <SelectValue placeholder="Select or leave blank" />
                    </SelectTrigger>
                    <SelectContent>
                      {KNOWN_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doc-desc">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  id="doc-desc" rows={2}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                />
              </div>

              {/* Progress bar */}
              {uploadStatus === 'uploading' && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Uploading…</span>
                    <span className="font-mono">{uploadPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadPct}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={!uploadFile || !uploadTitle.trim() || uploadStatus === 'uploading'}>
                  {uploadStatus === 'uploading'
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
                    : <><Upload className="mr-2 h-4 w-4" />Upload</>
                  }
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowUpload(false); setUploadFile(null) }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Filter + search bar ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            aria-label="Search documents by title, filename or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* ── Document list ── */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">
              {docs.length === 0 ? 'No documents yet' : 'No documents match your filter'}
            </p>
            <p className="text-sm text-muted-foreground">
              {docs.length === 0
                ? 'Click "Upload Document" to add the first one.'
                : 'Try clearing the search or category filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Card key={doc.id} className="group">
              <CardContent className="flex items-start gap-4 p-4">

                {/* File type icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {fileIcon(doc.mimeType)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="font-medium text-sm">{doc.title}</span>
                    {doc.category && (
                      <Badge variant="secondary" className="text-xs">{doc.category}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {doc.fileName} · {formatBytes(doc.fileSize)} ·{' '}
                    {new Date(doc.createdAt).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost" size="icon"
                    title="Open / download"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  {confirmDeleteId === doc.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="destructive" size="sm"
                        disabled={deletingId === doc.id}
                        onClick={() => handleDelete(doc.id)}
                      >
                        {deletingId === doc.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : 'Delete'
                        }
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost" size="icon"
                      title="Delete"
                      className="text-muted-foreground hover:text-red-500"
                      onClick={() => setConfirmDeleteId(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} document{filtered.length !== 1 ? 's' : ''}
        {docs.length !== filtered.length ? ` of ${docs.length}` : ''}
      </p>
    </MainLayout>
  )
}
