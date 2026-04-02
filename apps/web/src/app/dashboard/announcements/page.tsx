'use client'

import { useState } from 'react'
import { Megaphone, Plus, X } from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'

interface Announcement {
  id: string
  title: string
  body: string
  author: string
  createdAt: Date
  dismissed: boolean
}

export default function AnnouncementsPage() {
  const { role } = useRole()
  const canCreate = role === 'admin' || role === 'coach'

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setAnnouncements(prev => [{
      id: crypto.randomUUID(),
      title: form.title,
      body: form.body,
      author: role.charAt(0).toUpperCase() + role.slice(1),
      createdAt: new Date(),
      dismissed: false,
    }, ...prev])
    setForm({ title: '', body: '' })
    setShowCreate(false)
  }

  function dismiss(id: string) {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
  }

  const visible = announcements.filter(a => !a.dismissed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">Team-wide broadcasts</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" /> New Announcement
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-500">No announcements</p>
          {canCreate && (
            <p className="text-sm text-gray-400">Post an announcement for the whole team to see</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(item => (
            <div key={item.id} className="relative rounded-xl bg-white border border-gray-200 shadow-sm p-6">
              <button
                onClick={() => dismiss(item.id)}
                className="absolute right-4 top-4 rounded-md p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4 pr-8">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <Megaphone className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.body}</p>
                  <p className="mt-3 text-xs text-gray-400">
                    {item.author} · {item.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">New Announcement</h3>
              <button onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Race Season Kickoff"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write your announcement..."
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
