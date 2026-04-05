'use client'

import { useState, useEffect } from 'react'
import {
  HandHeart, Plus, X, Trash2, Clock, MapPin,
  CheckCircle, Users, ChevronDown, AlertCircle,
} from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@a-team/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RaceEvent {
  id: string
  title: string
  date: string        // YYYY-MM-DD
  location: string
}

interface Signup {
  name: string
  note: string
}

interface VolSlot {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  role: string
  description: string
  timeSlot: string
  location: string
  capacity: number
  signups: Signup[]
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'vol_slots_v1'
function loadSlots(): VolSlot[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function saveSlots(slots: VolSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(d: string) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Signup confirmation modal ────────────────────────────────────────────────

function SignupModal({
  slot,
  myName,
  onConfirm,
  onClose,
}: {
  slot: VolSlot
  myName: string
  onConfirm: (name: string, note: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(myName)
  const [note, setNote] = useState('')
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[rgb(var(--surface))] shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
          <div className="flex items-center gap-2">
            <HandHeart className="h-5 w-5 text-brand-500" />
            <h3 className="font-semibold text-[rgb(var(--text))]">Volunteer Sign Up</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-[rgb(var(--bg-secondary))]">
            <X className="h-5 w-5 text-[rgb(var(--text-muted))]" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Role summary */}
          <div className="rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 px-4 py-3 space-y-1">
            <p className="font-semibold text-[rgb(var(--text))]">{slot.role}</p>
            <p className="text-sm text-[rgb(var(--text-muted))]">{slot.eventTitle} · {formatDate(slot.eventDate)}</p>
            {slot.timeSlot && (
              <div className="flex items-center gap-1.5 text-sm text-[rgb(var(--text-muted))]">
                <Clock className="h-3.5 w-3.5" />{slot.timeSlot}
              </div>
            )}
            {slot.location && (
              <div className="flex items-center gap-1.5 text-sm text-[rgb(var(--text-muted))]">
                <MapPin className="h-3.5 w-3.5" />{slot.location}
              </div>
            )}
          </div>

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Your name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="First and last name"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none"
              required
            />
          </div>

          {/* Note field */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Note <span className="text-[rgb(var(--text-muted))] font-normal">(optional)</span></label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. I'll arrive 15 min early"
              className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none"
            />
          </div>

          {/* Agreement */}
          <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] p-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 accent-brand-500 cursor-pointer"
            />
            <span className="text-sm text-[rgb(var(--text))] leading-relaxed">
              I, <strong>{name || '___'}</strong>, agree to show up and do my best as{' '}
              <strong>{slot.role}</strong> for <strong>{slot.eventTitle}</strong>.
              I understand the team is counting on me.
            </span>
          </label>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-[rgb(var(--border))] py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))]">
              Cancel
            </button>
            <button
              onClick={() => { if (name.trim() && agreed) onConfirm(name.trim(), note.trim()) }}
              disabled={!name.trim() || !agreed}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
            >
              Confirm Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Add slot modal ───────────────────────────────────────────────────────────

function AddSlotModal({
  races,
  onAdd,
  onClose,
}: {
  races: RaceEvent[]
  onAdd: (slot: Omit<VolSlot, 'id' | 'signups'>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    eventId: races[0]?.id ?? '',
    role: '',
    description: '',
    timeSlot: '',
    location: '',
    capacity: 2,
  })

  const selectedRace = races.find(r => r.id === form.eventId)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.role.trim() || !selectedRace) return
    onAdd({
      eventId: selectedRace.id,
      eventTitle: selectedRace.title,
      eventDate: selectedRace.date,
      role: form.role,
      description: form.description,
      timeSlot: form.timeSlot,
      location: form.location,
      capacity: form.capacity,
    })
  }

  const inputCls = 'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2.5 text-sm text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-[rgb(var(--surface))] shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4 sticky top-0 bg-[rgb(var(--surface))] z-10">
          <h3 className="font-semibold text-[rgb(var(--text))]">Add Volunteer Slot</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-[rgb(var(--text-muted))]" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event dropdown */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Race / Event *</label>
            {races.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 px-3 py-2.5 text-sm text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                No upcoming races found. Add race events in the Calendar first.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={form.eventId}
                  onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))}
                  className={inputCls + ' pr-8 appearance-none cursor-pointer'}
                  required
                >
                  {races.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.title} — {formatDate(r.date)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--text-muted))]" />
              </div>
            )}
            {selectedRace?.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                <MapPin className="h-3 w-3" />{selectedRace.location}
              </p>
            )}
          </div>

          {/* Role name */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Role / Task name *</label>
            <input
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="e.g. Pit Zone Marshal, Course Sweep, Registration Table"
              className={inputCls}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Description <span className="text-[rgb(var(--text-muted))] font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will this volunteer be doing?"
              rows={2}
              className={inputCls + ' resize-none'}
            />
          </div>

          {/* Time slot + location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">
                <Clock className="inline h-3.5 w-3.5 mr-1" />Time slot
              </label>
              <input
                value={form.timeSlot}
                onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}
                placeholder="e.g. 7:00 – 9:00 AM"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">
                <MapPin className="inline h-3.5 w-3.5 mr-1" />Location
              </label>
              <input
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Pit Zone, Gate 3"
                className={inputCls}
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Spots needed</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, capacity: n }))}
                  className={cn(
                    'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                    form.capacity === n
                      ? 'bg-brand-600 text-white'
                      : 'border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]'
                  )}
                >
                  {n}
                </button>
              ))}
              <input
                type="number"
                min={1}
                max={50}
                value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                className="w-16 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-2 py-2 text-sm text-center text-[rgb(var(--text))] focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-[rgb(var(--border))] py-2.5 text-sm font-medium text-[rgb(var(--text))]">
              Cancel
            </button>
            <button type="submit" disabled={races.length === 0}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40">
              Add Slot
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VolunteersPage() {
  const supabase = createClient()
  const { role } = useRole()
  const canManage = role === 'admin' || role === 'coach'

  const [races, setRaces] = useState<RaceEvent[]>([])
  const [slots, setSlots] = useState<VolSlot[]>([])
  const [myName, setMyName] = useState('You')
  const [showAdd, setShowAdd] = useState(false)
  const [signingUp, setSigningUp] = useState<VolSlot | null>(null)

  // Load upcoming races from Supabase
  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, start_at, location')
      .eq('type', 'race')
      .gte('start_at', new Date().toISOString())
      .order('start_at')
      .then(({ data }) => {
        if (data) setRaces(data.map((r: any) => ({
          id: r.id,
          title: r.title,
          date: r.start_at.slice(0, 10),
          location: r.location ?? '',
        })))
      })

    // Load current user name
    const devBypass = document.cookie.includes('dev_bypass=1')
    if (devBypass) {
      const p = localStorage.getItem('dev_profile')
      if (p) { try { setMyName(JSON.parse(p).name || 'You') } catch {} }
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase.from('users').select('name').eq('id', data.user.id).single().then(({ data: u }) => {
            if (u?.name) setMyName(u.name)
          })
        }
      })
    }

    setSlots(loadSlots())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addSlot(slotData: Omit<VolSlot, 'id' | 'signups'>) {
    const updated = [...slots, { id: crypto.randomUUID(), ...slotData, signups: [] }]
    setSlots(updated)
    saveSlots(updated)
    setShowAdd(false)
  }

  function confirmSignup(slotId: string, name: string, note: string) {
    const updated = slots.map(s =>
      s.id === slotId ? { ...s, signups: [...s.signups, { name, note }] } : s
    )
    setSlots(updated)
    saveSlots(updated)
    setSigningUp(null)
  }

  function cancelSignup(slotId: string) {
    const updated = slots.map(s =>
      s.id === slotId ? { ...s, signups: s.signups.filter(su => su.name !== myName) } : s
    )
    setSlots(updated)
    saveSlots(updated)
  }

  function deleteSlot(slotId: string) {
    const updated = slots.filter(s => s.id !== slotId)
    setSlots(updated)
    saveSlots(updated)
  }

  // Group by event
  const byEvent: Record<string, { event: { id: string; title: string; date: string }; slots: VolSlot[] }> = {}
  for (const slot of slots) {
    if (!byEvent[slot.eventId]) {
      byEvent[slot.eventId] = { event: { id: slot.eventId, title: slot.eventTitle, date: slot.eventDate }, slots: [] }
    }
    byEvent[slot.eventId]!.slots.push(slot)
  }

  const totalOpen = slots.reduce((n, s) => n + Math.max(0, s.capacity - s.signups.length), 0)
  const totalFilled = slots.reduce((n, s) => n + s.signups.length, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Volunteering</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {slots.length > 0
              ? `${totalFilled} filled · ${totalOpen} spot${totalOpen !== 1 ? 's' : ''} open across ${slots.length} slot${slots.length !== 1 ? 's' : ''}`
              : 'Sign up to help at upcoming races'}
          </p>
        </div>
        {canManage && (
          <button onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Add Slot
          </button>
        )}
      </div>

      {/* Empty state */}
      {slots.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-16 text-center">
          <HandHeart className="mx-auto h-12 w-12 text-[rgb(var(--border))]" />
          <p className="mt-4 text-lg font-semibold text-[rgb(var(--text))]">No volunteer slots yet</p>
          <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">
            {canManage ? 'Add slots for upcoming races and parents/athletes can sign up.' : 'Check back when slots are added for upcoming races.'}
          </p>
          {canManage && (
            <button onClick={() => setShowAdd(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" /> Add First Slot
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.values(byEvent)
            .sort((a, b) => a.event.date.localeCompare(b.event.date))
            .map(({ event, slots: eventSlots }) => {
              const eventFilled = eventSlots.reduce((n, s) => n + s.signups.length, 0)
              const eventTotal  = eventSlots.reduce((n, s) => n + s.capacity, 0)
              const pct = eventTotal > 0 ? Math.round((eventFilled / eventTotal) * 100) : 0

              return (
                <div key={event.id} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] overflow-hidden shadow-sm">
                  {/* Event header */}
                  <div className="bg-brand-600 px-6 py-4 text-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-lg leading-tight">{event.title}</h2>
                        <p className="mt-0.5 text-sm text-white/80">{formatDate(event.date)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{eventFilled} / {eventTotal} spots filled</p>
                        <div className="mt-1.5 h-1.5 w-32 rounded-full bg-white/30 overflow-hidden">
                          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Slot rows */}
                  <div className="divide-y divide-[rgb(var(--border))]">
                    {eventSlots.map(slot => {
                      const isMeSigned = slot.signups.some(su => su.name === myName)
                      const filled = slot.signups.length
                      const pctSlot = slot.capacity > 0 ? (filled / slot.capacity) * 100 : 0
                      const isFull  = filled >= slot.capacity

                      return (
                        <div key={slot.id} className="group px-6 py-4 hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Left: role info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div>
                                  <p className="font-semibold text-[rgb(var(--text))]">{slot.role}</p>
                                  {slot.description && (
                                    <p className="mt-0.5 text-sm text-[rgb(var(--text-muted))]">{slot.description}</p>
                                  )}
                                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-[rgb(var(--text-muted))]">
                                    {slot.timeSlot && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />{slot.timeSlot}
                                      </span>
                                    )}
                                    {slot.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />{slot.location}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right: action */}
                                <div className="flex items-center gap-2 shrink-0">
                                  {isMeSigned ? (
                                    <button onClick={() => cancelSignup(slot.id)}
                                      className="flex items-center gap-1.5 rounded-lg border border-green-300 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors">
                                      <CheckCircle className="h-4 w-4" /> Signed up
                                    </button>
                                  ) : isFull ? (
                                    <span className="rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-sm text-[rgb(var(--text-muted))]">
                                      Full
                                    </span>
                                  ) : (
                                    <button onClick={() => setSigningUp(slot)}
                                      className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors">
                                      Sign Up
                                    </button>
                                  )}
                                  {canManage && (
                                    <button onClick={() => deleteSlot(slot.id)}
                                      className="hidden group-hover:flex rounded-lg p-1.5 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Spots + progress */}
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
                                    <Users className="h-3.5 w-3.5" />
                                    <span className={cn('font-medium', isFull ? 'text-green-600 dark:text-green-400' : '')}>
                                      {filled} of {slot.capacity} {isFull ? '— Full! ✓' : `spot${slot.capacity !== 1 ? 's' : ''} filled`}
                                    </span>
                                  </div>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-[rgb(var(--bg-secondary))] overflow-hidden">
                                  <div
                                    className={cn('h-full rounded-full transition-all', isFull ? 'bg-green-500' : 'bg-brand-500')}
                                    style={{ width: `${pctSlot}%` }}
                                  />
                                </div>

                                {/* Volunteer avatars */}
                                {slot.signups.length > 0 && (
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {slot.signups.map((su, i) => (
                                      <div key={i} className="flex items-center gap-1.5">
                                        <div className={cn(
                                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                          su.name === myName
                                            ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 ring-2 ring-brand-400'
                                            : 'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]'
                                        )} title={su.name}>
                                          {initials(su.name)}
                                        </div>
                                        <span className="text-xs text-[rgb(var(--text-muted))]">{su.name}</span>
                                        {su.note && <span className="text-xs text-[rgb(var(--text-muted))] opacity-60">· {su.note}</span>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddSlotModal races={races} onAdd={addSlot} onClose={() => setShowAdd(false)} />
      )}
      {signingUp && (
        <SignupModal
          slot={signingUp}
          myName={myName}
          onConfirm={(name, note) => confirmSignup(signingUp.id, name, note)}
          onClose={() => setSigningUp(null)}
        />
      )}
    </div>
  )
}
