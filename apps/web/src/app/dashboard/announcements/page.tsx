'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Plus, X, Mail, Copy, Check } from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@a-team/utils'

interface Announcement {
  id: string
  title: string
  body: string
  author: string
  createdAt: Date
  dismissed: boolean
}

type EmailAudience = 'all' | 'athletes' | 'coaches' | 'parents'

export default function AnnouncementsPage() {
  const { role } = useRole()
  const supabase = createClient()
  const canCreate = role === 'admin' || role === 'coach'

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', body: '' })

  // Email copy tool
  const [showEmailTool, setShowEmailTool] = useState(false)
  const [emailAudience, setEmailAudience] = useState<EmailAudience>('all')
  const [emails, setEmails] = useState<string[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [copied, setCopied] = useState(false)

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

  async function loadEmails(audience: EmailAudience) {
    setLoadingEmails(true)
    setEmails([])
    let query = supabase.from('roster_members').select('email').not('email', 'is', null)
    if (audience !== 'all') {
      const roleMap: Record<string, string> = { athletes: 'athlete', coaches: 'coach', parents: 'parent' }
      query = query.eq('role', roleMap[audience]!)
    }
    const { data } = await query
    setLoadingEmails(false)
    if (data) setEmails(data.map((r: { email: string }) => r.email).filter(Boolean))
  }

  useEffect(() => {
    if (showEmailTool) loadEmails(emailAudience)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmailTool, emailAudience])

  function handleCopy() {
    navigator.clipboard.writeText(emails.join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const visible = announcements.filter(a => !a.dismissed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Announcements</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">Team-wide broadcasts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canCreate && (
            <button
              onClick={() => setShowEmailTool(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))]"
            >
              <Mail className="h-4 w-4" /> Email Recipients
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              <Plus className="h-4 w-4" /> New Announcement
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-12 text-center">
          <Megaphone className="mx-auto h-10 w-10 text-[rgb(var(--border))]" />
          <p className="mt-3 font-medium text-[rgb(var(--text-muted))]">No announcements</p>
          {canCreate && (
            <p className="text-sm text-[rgb(var(--text-muted))] opacity-60">Post an announcement for the whole team to see</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(item => (
            <div key={item.id} className="relative rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-sm p-6">
              <button
                onClick={() => dismiss(item.id)}
                className="absolute right-4 top-4 rounded-md p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-4 pr-8">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/50">
                  <Megaphone className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text))]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))] leading-relaxed">{item.body}</p>
                  <p className="mt-3 text-xs text-[rgb(var(--text-muted))] opacity-60">
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
          <div className="w-full max-w-lg rounded-2xl bg-[rgb(var(--surface))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">New Announcement</h3>
              <button onClick={() => setShowCreate(false)}><X className="h-5 w-5 text-[rgb(var(--text-muted))]" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Race Season Kickoff"
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Message</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Write your announcement..."
                  rows={5}
                  className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-lg border border-[rgb(var(--border))] py-2.5 text-sm font-medium text-[rgb(var(--text))]">Cancel</button>
                <button type="submit"
                  className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email recipients modal */}
      {showEmailTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowEmailTool(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-[rgb(var(--surface))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">Email Recipients</h3>
              <button onClick={() => setShowEmailTool(false)}><X className="h-5 w-5 text-[rgb(var(--text-muted))]" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-[rgb(var(--text))] mb-3">Select audience</p>
                <div className="grid grid-cols-4 gap-2">
                  {(['all', 'athletes', 'coaches', 'parents'] as const).map(a => (
                    <button key={a} onClick={() => setEmailAudience(a)}
                      className={cn('rounded-lg border-2 py-2.5 text-sm font-medium capitalize transition-colors',
                        emailAudience === a
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                          : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-[rgb(var(--text-muted))]'
                      )}>
                      {a === 'all' ? 'Everyone' : a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[rgb(var(--text))]">
                    {loadingEmails ? 'Loading…' : `${emails.length} address${emails.length !== 1 ? 'es' : ''}`}
                  </p>
                  <button onClick={handleCopy} disabled={emails.length === 0}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))] disabled:opacity-40 transition-colors">
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy all'}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] p-3 text-sm text-[rgb(var(--text-muted))]">
                  {loadingEmails ? (
                    <p className="text-center py-4">Loading emails…</p>
                  ) : emails.length === 0 ? (
                    <p className="text-center py-4">No email addresses found</p>
                  ) : (
                    <p className="break-all leading-relaxed">{emails.join(', ')}</p>
                  )}
                </div>
                <p className="mt-2 text-xs text-[rgb(var(--text-muted))] opacity-60">
                  Copy these addresses into your email client's BCC field
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
