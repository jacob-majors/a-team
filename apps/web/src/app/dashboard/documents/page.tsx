'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, Download, ExternalLink, Plus, X, Upload, Search, Trash2, Link2 } from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@a-team/utils'

interface Doc {
  id: string
  name: string
  description: string
  url: string
  category: string
  type: 'file' | 'link'
  uploadedBy: string
  createdAt: string
}

const CATEGORIES = ['All', 'Waivers & Forms', 'Race Info', 'Team Policies', 'Resources']

const CATEGORY_COLORS: Record<string, string> = {
  'Waivers & Forms': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  'Race Info':       'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  'Team Policies':   'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300',
  'Resources':       'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]',
}

const STORAGE_KEY = 'documents_v1'

function loadLocal(): Doc[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveLocal(docs: Doc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
}

export default function DocumentsPage() {
  const { role } = useRole()
  const supabase = createClient()
  const canManage = role === 'admin' || role === 'coach'
  const fileRef = useRef<HTMLInputElement>(null)

  const [docs, setDocs] = useState<Doc[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', url: '', category: 'Resources', type: 'link' as 'file' | 'link',
  })

  // Load from Supabase, fall back to localStorage
  useEffect(() => {
    supabase.from('documents').select('*').order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setDocs(data.map((r: any) => ({
            id: r.id, name: r.name, description: r.description ?? '',
            url: r.url ?? '', category: r.category, type: r.type,
            uploadedBy: r.uploaded_by ?? '', createdAt: r.created_at,
          })))
        } else {
          // Fall back to localStorage if table doesn't exist yet
          setDocs(loadLocal())
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function persist(newDocs: Doc[]) {
    setDocs(newDocs)
    saveLocal(newDocs)
  }

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    const newDoc: Doc = {
      id: crypto.randomUUID(),
      ...form,
      uploadedBy: role,
      createdAt: new Date().toISOString(),
    }

    // Try Supabase first
    const { error } = await supabase.from('documents').insert({
      id: newDoc.id, name: newDoc.name, description: newDoc.description || null,
      url: newDoc.url || null, category: newDoc.category, type: newDoc.type,
      uploaded_by: newDoc.uploadedBy, created_at: newDoc.createdAt,
    })

    if (error) {
      // Table doesn't exist yet — save locally
      await persist([newDoc, ...docs])
    } else {
      setDocs(prev => [newDoc, ...prev])
      saveLocal([newDoc, ...docs])
    }

    setSaving(false)
    setForm({ name: '', description: '', url: '', category: 'Resources', type: 'link' })
    setShowAdd(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Without storage, we save name + a note — file upload requires storage setup
    setForm({
      name: file.name.replace(/\.[^.]+$/, ''),
      description: `Uploaded file: ${file.name}`,
      url: '',
      category: 'Resources',
      type: 'file',
    })
    setShowAdd(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function deleteDoc(id: string) {
    const updated = docs.filter(d => d.id !== id)
    await supabase.from('documents').delete().eq('id', id) // no-op if table missing
    persist(updated)
  }

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || d.category === catFilter
    return matchSearch && matchCat
  })

  const inputCls = 'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Documents & Forms</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">Team files, waivers, and resources</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-3 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))]">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload File</span>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Add Link</span>
              <span className="sm:hidden">Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] py-2.5 pl-9 pr-4 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none"
        />
      </div>

      {/* Category filters — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0',
              catFilter === cat
                ? 'bg-brand-600 text-white'
                : 'bg-[rgb(var(--surface))] border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-[rgb(var(--border))]" />
          <p className="mt-3 font-medium text-[rgb(var(--text-muted))]">No documents yet</p>
          {canManage && <p className="text-sm text-[rgb(var(--text-muted))] opacity-60">Upload files or add links above</p>}
        </div>
      ) : (
        <div className="rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-sm overflow-hidden">
          <div className="divide-y divide-[rgb(var(--border))]">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40">
                  {doc.type === 'link'
                    ? <Link2 className="h-5 w-5 text-brand-500" />
                    : <FileText className="h-5 w-5 text-brand-500" />}
                </div>

                {/* Info — tappable on mobile */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[rgb(var(--text))] truncate text-sm">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS['Resources'])}>
                      {doc.category}
                    </span>
                    {doc.description && (
                      <span className="text-xs text-[rgb(var(--text-muted))] truncate max-w-[160px]">{doc.description}</span>
                    )}
                  </div>
                </div>

                {/* Actions — always visible (mobile-friendly) */}
                <div className="flex items-center gap-1 shrink-0">
                  {doc.url ? (
                    doc.type === 'link' ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg p-2 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))] hover:text-brand-500 transition-colors"
                        title="Open link">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <a href={doc.url} download
                        className="rounded-lg p-2 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))] hover:text-brand-500 transition-colors"
                        title="Download">
                        <Download className="h-4 w-4" />
                      </a>
                    )
                  ) : (
                    <span className="rounded-lg px-2 py-1 text-xs text-[rgb(var(--text-muted))] opacity-50">No file</span>
                  )}
                  {canManage && (
                    <button onClick={() => deleteDoc(doc.id)}
                      className="rounded-lg p-2 text-[rgb(var(--text-muted))] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                      title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
          onClick={() => setShowAdd(false)}>
          <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-[rgb(var(--surface))] shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {/* Drag handle on mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-[rgb(var(--border))]" />
            </div>
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Add Document / Link</h3>
              <button onClick={() => setShowAdd(false)}>
                <X className="h-5 w-5 text-[rgb(var(--text-muted))]" />
              </button>
            </div>
            <form onSubmit={handleAddDoc} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="e.g. 2025 Medical Waiver"
                  className={inputCls} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">URL</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://…" type="url"
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={inputCls}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">
                  Description <span className="text-[rgb(var(--text-muted))] font-normal">(optional)</span>
                </label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                  className={inputCls} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-lg border border-[rgb(var(--border))] py-2.5 text-sm font-medium text-[rgb(var(--text))]">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
