'use client'

import { useState, useRef } from 'react'
import { FileText, Download, ExternalLink, Plus, X, Upload, Search } from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'

interface Doc {
  id: string
  name: string
  description: string
  url: string
  category: string
  type: 'file' | 'link'
  uploadedBy: string
  createdAt: Date
}

const CATEGORIES = ['All', 'Waivers & Forms', 'Race Info', 'Team Policies', 'Resources']

const CATEGORY_COLORS: Record<string, string> = {
  'Waivers & Forms': 'bg-blue-100 text-blue-700',
  'Race Info': 'bg-green-100 text-green-700',
  'Team Policies': 'bg-purple-100 text-purple-700',
  'Resources': 'bg-gray-100 text-gray-700',
}

export default function DocumentsPage() {
  const { role } = useRole()
  const canManage = role === 'admin' || role === 'coach'
  const fileRef = useRef<HTMLInputElement>(null)

  const [docs, setDocs] = useState<Doc[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', url: '', category: 'Resources', type: 'link' as 'file' | 'link' })

  const filtered = docs.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || d.category === catFilter
    return matchSearch && matchCat
  })

  function handleAddDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setDocs(prev => [{
      id: crypto.randomUUID(),
      ...form,
      uploadedBy: role,
      createdAt: new Date(),
    }, ...prev])
    setForm({ name: '', description: '', url: '', category: 'Resources', type: 'link' })
    setShowAdd(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fakeUrl = URL.createObjectURL(file)
    setDocs(prev => [{
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, ''),
      description: '',
      url: fakeUrl,
      category: 'Resources',
      type: 'file',
      uploadedBy: role,
      createdAt: new Date(),
    }, ...prev])
    if (fileRef.current) fileRef.current.value = ''
  }

  function deleteDoc(id: string) {
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents & Forms</h1>
          <p className="text-sm text-gray-500">Team files, waivers, and resources</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Upload className="h-4 w-4" /> Upload File
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" /> Add Link
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFilter(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              catFilter === cat ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-500">No documents yet</p>
          {canManage && <p className="text-sm text-gray-400">Upload files or add links above</p>}
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                  <FileText className="h-5 w-5 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[doc.category] ?? 'bg-gray-100 text-gray-700'}`}>
                      {doc.category}
                    </span>
                    {doc.description && <span className="text-xs text-gray-400 truncate">{doc.description}</span>}
                    <span className="text-xs text-gray-400">
                      {doc.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {doc.type === 'link' ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <a href={doc.url} download className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                  {canManage && (
                    <button onClick={() => deleteDoc(doc.id)} className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add link modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Document / Link</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddDoc} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="e.g. 2025 Medical Waiver"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Optional short description"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
