'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Save, User } from 'lucide-react'
import { useTheme } from '@/components/theme/provider'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@a-team/utils'

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Always light' },
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Always dark' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your device' },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: profile } = await supabase
        .from('users')
        .select('name, phone, email_opt_in')
        .eq('id', data.user.id)
        .single()
      if (profile) {
        setName(profile.name ?? '')
        setPhone(profile.phone ?? '')
        setEmailOptIn(profile.email_opt_in ?? true)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    await supabase.from('users').update({
      name: name.trim(),
      phone: phone.trim() || null,
      email_opt_in: emailOptIn,
    }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Settings</h1>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Manage your account and preferences</p>
      </div>

      {/* Theme */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
        <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-1">Appearance</h2>
        <p className="text-sm text-[rgb(var(--text-muted))] mb-5">Choose how A-Team looks for you.</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                theme === value
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
                  : 'border-[rgb(var(--border))] hover:border-[rgb(var(--text-muted))]'
              )}
            >
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full',
                theme === value ? 'bg-brand-500 text-white' : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]'
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn('text-sm font-semibold', theme === value ? 'text-brand-600 dark:text-brand-400' : 'text-[rgb(var(--text))]')}>{label}</p>
                <p className="text-xs text-[rgb(var(--text-muted))]">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Profile */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
        <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-1 flex items-center gap-2">
          <User className="h-4 w-4" /> Profile
        </h2>
        <p className="text-sm text-[rgb(var(--text-muted))] mb-5">Update your personal information.</p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Display name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailOptIn"
              checked={emailOptIn}
              onChange={e => setEmailOptIn(e.target.checked)}
              className="h-4 w-4 rounded border-[rgb(var(--border))] text-brand-500"
            />
            <label htmlFor="emailOptIn" className="text-sm text-[rgb(var(--text))]">
              Receive team emails and announcements
            </label>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </button>
        </form>
      </section>
    </div>
  )
}
