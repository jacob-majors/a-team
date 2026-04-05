'use client'

import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor, Save, Check, Plus, X, Users, Camera, Hash, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/components/theme/provider'
import { createClient } from '@/lib/supabase/client'
import { useShadow } from '@/components/layout/shadow-context'
import { cn } from '@a-team/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: Sun,     desc: 'Always light' },
  { value: 'dark',   label: 'Dark',   icon: Moon,    desc: 'Always dark' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follows your device' },
] as const

// Roster flags → readable group labels + which chat channel they unlock
const GROUP_MAP: { key: string; label: string; color: string; channel: string | null }[] = [
  { key: 'is_racer',          label: 'Racer',        color: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',   channel: null },
  { key: 'is_hs_athlete',     label: 'HS Athlete',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',       channel: 'hs-athletes' },
  { key: 'is_dev_athlete',    label: 'Devo',         color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300', channel: 'devo' },
  { key: 'is_grit',           label: 'GRiT',         color: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300',       channel: null },
  { key: 'is_team_captain',   label: 'Team Captain', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300', channel: null },
  { key: 'is_windsor_hs',     label: 'Windsor HS',   color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',       channel: null },
  { key: 'has_training_peaks',label: 'Training Peaks',color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300', channel: null },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkedAthlete {
  id: string
  athleteMemberId: string
  athleteName: string
  athleteRole: string
}

interface RosterMember {
  id: string
  role: string
  is_racer: boolean
  is_hs_athlete: boolean
  is_dev_athlete: boolean
  is_grit: boolean
  is_team_captain: boolean
  is_windsor_hs: boolean
  has_training_peaks: boolean
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { setShadow } = useShadow()
  const supabase = createClient()
  const photoRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isDevUser, setIsDevUser] = useState(false)

  // Photo
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  // Roster / groups
  const [rosterMember, setRosterMember] = useState<RosterMember | null>(null)
  const [myMemberId, setMyMemberId] = useState<string | null>(null)

  // Family / shadow
  const [linkedAthletes, setLinkedAthletes] = useState<LinkedAthlete[]>([])
  const [athleteEmailInput, setAthleteEmailInput] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  // ── Load profile ────────────────────────────────────────────────
  useEffect(() => {
    const devBypass = document.cookie.includes('dev_bypass=1')
    if (devBypass) {
      setIsDevUser(true)
      const stored = localStorage.getItem('dev_profile')
      if (stored) {
        const p = JSON.parse(stored)
        setName(p.name ?? '')
        setPhone(p.phone ?? '')
        setEmailOptIn(p.email_opt_in ?? true)
        if (p.avatar_url) setAvatarUrl(p.avatar_url)
      } else {
        setName('Jacob Majors')
      }
      return
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)

      const { data: profile } = await supabase
        .from('users').select('name, phone, email_opt_in, avatar_url').eq('id', data.user.id).single()

      if (profile) {
        setName(profile.name ?? '')
        setPhone(profile.phone ?? '')
        setEmailOptIn(profile.email_opt_in ?? true)
        if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
      } else {
        setName(data.user.user_metadata?.['full_name'] ?? data.user.user_metadata?.['name'] ?? '')
        const googleAvatar = data.user.user_metadata?.['avatar_url']
        if (googleAvatar) setAvatarUrl(googleAvatar)
      }

      // Load roster member
      if (data.user.email) {
        const { data: member } = await supabase
          .from('roster_members')
          .select('id, role, is_racer, is_hs_athlete, is_dev_athlete, is_grit, is_team_captain, is_windsor_hs, has_training_peaks')
          .ilike('email', data.user.email).maybeSingle()
        if (member) {
          setRosterMember(member as RosterMember)
          setMyMemberId(member.id)
          loadLinkedAthletes(member.id)
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Photo upload ─────────────────────────────────────────────────
  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setPhotoError(null)

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPhotoPreview(objectUrl)
    setUploadingPhoto(true)

    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setPhotoError('Upload failed — make sure the "avatars" storage bucket exists in Supabase.')
      setPhotoPreview(null)
      setUploadingPhoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl)
    setPhotoPreview(null)

    // Save URL to users table
    await supabase.from('users').upsert({ id: userId, avatar_url: publicUrl }, { onConflict: 'id' })
    setUploadingPhoto(false)
  }

  // ── Save profile ─────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (isDevUser) {
      localStorage.setItem('dev_profile', JSON.stringify({
        name: name.trim(), phone: phone.trim() || null,
        email_opt_in: emailOptIn, avatar_url: avatarUrl,
      }))
      setSaving(false); setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      return
    }

    if (!userId) { setSaving(false); return }

    const { error } = await supabase.from('users').upsert({
      id: userId,
      name: name.trim(),
      phone: phone.trim() || null,
      email_opt_in: emailOptIn,
      email: (await supabase.auth.getUser()).data.user?.email ?? '',
    }, { onConflict: 'id' })

    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
  }

  // ── Family linking ───────────────────────────────────────────────
  async function loadLinkedAthletes(memberId: string) {
    const { data } = await supabase
      .from('parent_athlete_links').select('id, athlete_member_id').eq('parent_member_id', memberId)
    if (!data) return
    const ids = data.map((r: any) => r.athlete_member_id)
    if (ids.length === 0) { setLinkedAthletes([]); return }
    const { data: athletes } = await supabase
      .from('roster_members').select('id, full_name, role').in('id', ids)
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
    setLinkError(null); setLinking(true)
    const { data: athlete } = await supabase
      .from('roster_members').select('id, full_name, role').ilike('email', email).maybeSingle()
    if (!athlete) { setLinkError('No roster member found with that email.'); setLinking(false); return }
    if (athlete.id === myMemberId) { setLinkError("You can't link to yourself."); setLinking(false); return }
    const { error } = await supabase.from('parent_athlete_links').insert({
      parent_member_id: myMemberId, athlete_member_id: athlete.id,
    })
    if (error) setLinkError(error.code === '23505' ? 'Already linked.' : error.message)
    else { setAthleteEmailInput(''); await loadLinkedAthletes(myMemberId) }
    setLinking(false)
  }

  async function handleUnlink(linkId: string) {
    await supabase.from('parent_athlete_links').delete().eq('id', linkId)
    if (myMemberId) await loadLinkedAthletes(myMemberId)
  }

  // ── Computed ─────────────────────────────────────────────────────
  const initials = getInitials(name)
  const displayAvatar = photoPreview ?? avatarUrl
  const myGroups = GROUP_MAP.filter(g => rosterMember?.[g.key as keyof RosterMember] === true)
  const roleLabel = rosterMember?.role
    ? rosterMember.role.charAt(0).toUpperCase() + rosterMember.role.slice(1)
    : null

  const inputCls = 'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Settings</h1>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Manage your account and preferences</p>
      </div>

      {/* ── Appearance ── */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
        <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-1">Appearance</h2>
        <p className="text-sm text-[rgb(var(--text-muted))] mb-5">Choose how A-Team looks for you.</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
            <button key={value} onClick={() => setTheme(value)}
              className={cn('flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                theme === value ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50' : 'border-[rgb(var(--border))] hover:border-[rgb(var(--text-muted))]')}>
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-full',
                theme === value ? 'bg-brand-500 text-white' : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]')}>
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

      {/* ── Profile ── */}
      <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
        <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-5">Profile</h2>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative group">
            <div className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-brand-100 dark:ring-brand-900 overflow-hidden',
              displayAvatar ? '' : 'bg-brand-600'
            )}>
              {displayAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayAvatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
            </div>
            {/* Upload overlay */}
            {!isDevUser && (
              <button
                type="button"
                onClick={() => photoRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change photo"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            )}
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div>
            <p className="font-semibold text-[rgb(var(--text))] text-lg">{name || 'Your Name'}</p>
            {roleLabel && <p className="text-sm text-[rgb(var(--text-muted))] capitalize">{roleLabel}</p>}
            {!isDevUser && (
              <button type="button" onClick={() => photoRef.current?.click()}
                className="mt-1.5 text-xs text-brand-500 hover:text-brand-600 transition-colors">
                {avatarUrl ? 'Change photo' : 'Upload photo'}
              </button>
            )}
          </div>
        </div>

        {photoError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-sm text-red-600 dark:text-red-400">
            {photoError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Display name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" className={inputCls} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="emailOptIn" checked={emailOptIn}
              onChange={e => setEmailOptIn(e.target.checked)}
              className="h-4 w-4 rounded border-[rgb(var(--border))] accent-brand-500" />
            <label htmlFor="emailOptIn" className="text-sm text-[rgb(var(--text))]">
              Receive team emails and announcements
            </label>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </button>
        </form>
      </section>

      {/* ── Team membership & chat groups ── */}
      {rosterMember && (
        <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
          <h2 className="text-base font-semibold text-[rgb(var(--text))] mb-1">Team Membership</h2>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-5">
            Your groups based on your roster profile. These also determine which chat channels you have access to.
          </p>

          {myGroups.length === 0 ? (
            <p className="text-sm text-[rgb(var(--text-muted))]">No group flags set on your roster profile. Contact your team director.</p>
          ) : (
            <div className="space-y-2">
              {myGroups.map(group => (
                <div key={group.key}
                  className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', group.color)}>
                      {group.label}
                    </span>
                    {group.channel && (
                      <span className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                        <Hash className="h-3 w-3" />{group.channel}
                      </span>
                    )}
                  </div>
                  {group.channel && (
                    <Link href="/dashboard/chat"
                      className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--text-muted))] hover:text-brand-500 hover:border-brand-400 transition-colors">
                      Open chat <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Role-based channels */}
          <div className="mt-4 pt-4 border-t border-[rgb(var(--border))]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-3">Chat channels you can access</p>
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] px-3 py-1 text-sm text-[rgb(var(--text))]">
                <Hash className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" /> all-members
              </span>
              {(rosterMember.role === 'coach' || rosterMember.role === 'admin') && (
                <span className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-1 text-sm text-blue-700 dark:text-blue-300">
                  <Hash className="h-3.5 w-3.5" /> coaches
                </span>
              )}
              {rosterMember.is_hs_athlete && (
                <span className="flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-1 text-sm text-blue-700 dark:text-blue-300">
                  <Hash className="h-3.5 w-3.5" /> hs-athletes
                </span>
              )}
              {rosterMember.is_dev_athlete && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 px-3 py-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <Hash className="h-3.5 w-3.5" /> devo
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Family / Shadow mode ── */}
      {!isDevUser && (
        <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-brand-500" />
            <h2 className="text-base font-semibold text-[rgb(var(--text))]">Family — Linked Athletes</h2>
          </div>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-5">
            Link your athlete's account to view the app as them. Enter the email address on their roster profile.
          </p>

          {linkedAthletes.length > 0 && (
            <div className="mb-4 space-y-2">
              {linkedAthletes.map(link => (
                <div key={link.id}
                  className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/50 text-sm font-bold text-brand-700 dark:text-brand-300">
                      {link.athleteName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
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

          <div className="flex gap-2">
            <input value={athleteEmailInput} onChange={e => setAthleteEmailInput(e.target.value)}
              placeholder="Athlete's roster email address" className={inputCls + ' flex-1'} />
            <button onClick={handleLinkAthlete} disabled={!athleteEmailInput.trim() || linking}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors">
              <Plus className="h-4 w-4" />{linking ? 'Linking…' : 'Link'}
            </button>
          </div>
          {linkError && <p className="mt-2 text-sm text-red-500">{linkError}</p>}
          <p className="mt-2 text-xs text-[rgb(var(--text-muted))] opacity-70">
            The email must match what's on the roster. Ask your team director if you're unsure.
          </p>
        </section>
      )}
    </div>
  )
}
