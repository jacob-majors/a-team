'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Monitor, Save, Check, Plus, X, Users } from 'lucide-react'
import { useTheme } from '@/components/theme/provider'
import { createClient } from '@/lib/supabase/client'
import { useShadow } from '@/components/layout/shadow-context'
import { cn } from '@a-team/utils'

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Always light' },
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Always dark' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your device' },
] as const

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

interface LinkedAthlete {
  id: string
  athleteMemberId: string
  athleteName: string
  athleteRole: string
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { setShadow } = useShadow()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isDevUser, setIsDevUser] = useState(false)

  // Family / shadow
  const [myMemberId, setMyMemberId] = useState<string | null>(null)
  const [linkedAthletes, setLinkedAthletes] = useState<LinkedAthlete[]>([])
  const [athleteEmailInput, setAthleteEmailInput] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  useEffect(() => {
    const devBypass = document.cookie.includes('dev_bypass=1')

    if (devBypass) {
      setIsDevUser(true)
      // Load from localStorage for dev user
      const stored = localStorage.getItem('dev_profile')
      if (stored) {
        const p = JSON.parse(stored)
        setName(p.name ?? '')
        setPhone(p.phone ?? '')
        setEmailOptIn(p.email_opt_in ?? true)
      } else {
        setName('Jacob Majors')
      }
      return
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      // Try to load profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('name, phone, email_opt_in')
        .eq('id', data.user.id)
        .single()

      if (!error && profile) {
        setName(profile.name ?? '')
        setPhone(profile.phone ?? '')
        setEmailOptIn(profile.email_opt_in ?? true)
      } else {
        // Row doesn't exist yet — pre-fill from auth metadata
        setName(data.user.user_metadata?.['full_name'] ?? data.user.user_metadata?.['name'] ?? '')
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load my roster member ID and linked athletes
  useEffect(() => {
    if (isDevUser || !userId) return
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user?.email) return
      const { data: member } = await supabase
        .from('roster_members').select('id').ilike('email', data.user.email).maybeSingle()
      if (!member) return
      setMyMemberId(member.id)
      loadLinkedAthletes(member.id)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isDevUser])

  async function loadLinkedAthletes(memberId: string) {
    const { data } = await supabase
      .from('parent_athlete_links')
      .select('id, athlete_member_id')
      .eq('parent_member_id', memberId)
    if (!data) return
    const athleteIds = data.map((r: any) => r.athlete_member_id)
    if (athleteIds.length === 0) { setLinkedAthletes([]); return }
    const { data: athletes } = await supabase
      .from('roster_members').select('id, full_name, role').in('id', athleteIds)
    if (athletes) {
      setLinkedAthletes(data.map((r: any) => {
        const a = athletes.find((x: any) => x.id === r.athlete_member_id)
        return { id: r.id, athleteMemberId: r.athlete_member_id, athleteName: a?.full_name ?? 'Unknown', athleteRole: a?.role ?? 'athlete' }
      }))
    }
  }

  async function handleLinkAthlete() {
    const email = athleteEmailInput.trim()
    if (!email || !myMemberId) return
    setLinkError(null)
    setLinking(true)
    const { data: athlete } = await supabase
      .from('roster_members').select('id, full_name, role').ilike('email', email).maybeSingle()
    if (!athlete) {
      setLinkError('No roster member found with that email.')
      setLinking(false)
      return
    }
    if (athlete.id === myMemberId) {
      setLinkError("You can't link to yourself.")
      setLinking(false)
      return
    }
    const { error } = await supabase.from('parent_athlete_links').insert({
      parent_member_id: myMemberId, athlete_member_id: athlete.id,
    })
    if (error) {
      setLinkError(error.code === '23505' ? 'Already linked to this person.' : error.message)
    } else {
      setAthleteEmailInput('')
      await loadLinkedAthletes(myMemberId)
    }
    setLinking(false)
  }

  async function handleUnlink(linkId: string) {
    await supabase.from('parent_athlete_links').delete().eq('id', linkId)
    if (myMemberId) await loadLinkedAthletes(myMemberId)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (isDevUser) {
      // Save to localStorage for dev bypass
      localStorage.setItem('dev_profile', JSON.stringify({
        name: name.trim(),
        phone: phone.trim() || null,
        email_opt_in: emailOptIn,
      }))
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      return
    }

    if (!userId) { setSaving(false); return }

    // Upsert so it works even if the row doesn't exist yet
    const { error } = await supabase.from('users').upsert({
      id: userId,
      name: name.trim(),
      phone: phone.trim() || null,
      email_opt_in: emailOptIn,
      // email is required — get it from auth
      email: (await supabase.auth.getUser()).data.user?.email ?? '',
    }, { onConflict: 'id' })

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const initials = getInitials(name)

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
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50'
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
        <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-5">Profile</h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white ring-4 ring-brand-100 dark:ring-brand-900">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">{name || 'Your Name'}</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">Your initials are shown as your avatar</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Display name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
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
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </button>
        </form>
      </section>
      {/* Family / Shadow mode */}
      {!isDevUser && (
        <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-brand-500" />
            <h2 className="text-base font-semibold text-[rgb(var(--text))]">Family — Linked Athletes</h2>
          </div>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-5">
            Link your athlete's account so you can view the app as them. Enter the email address on their roster profile.
          </p>

          {/* Existing links */}
          {linkedAthletes.length > 0 && (
            <div className="mb-4 space-y-2">
              {linkedAthletes.map(link => (
                <div key={link.id} className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/50 text-sm font-bold text-brand-700 dark:text-brand-300">
                      {link.athleteName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[rgb(var(--text))]">{link.athleteName}</p>
                      <p className="text-xs text-[rgb(var(--text-muted))] capitalize">{link.athleteRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShadow({ memberId: link.athleteMemberId, name: link.athleteName, role: link.athleteRole })}
                      className="rounded-lg border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/30 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-950/50 transition-colors">
                      View as {link.athleteName.split(' ')[0]}
                    </button>
                    <button onClick={() => handleUnlink(link.id)}
                      className="rounded-lg p-1.5 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add link form */}
          <div className="flex gap-2">
            <input
              value={athleteEmailInput}
              onChange={e => setAthleteEmailInput(e.target.value)}
              placeholder="Athlete's roster email address"
              className="flex-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={handleLinkAthlete}
              disabled={!athleteEmailInput.trim() || linking}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors">
              <Plus className="h-4 w-4" />
              {linking ? 'Linking…' : 'Link'}
            </button>
          </div>
          {linkError && <p className="mt-2 text-sm text-red-500">{linkError}</p>}
          <p className="mt-2 text-xs text-[rgb(var(--text-muted))] opacity-70">
            The athlete's email must match what's on the roster. Ask your team director if you're unsure.
          </p>
        </section>
      )}
    </div>
  )
}
