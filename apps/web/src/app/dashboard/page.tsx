'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Loader2 } from 'lucide-react'
import { cn } from '@a-team/utils'
import { createClient } from '@/lib/supabase/client'

type EventType = 'practice' | 'race' | 'meeting'

interface CalEvent {
  id: string
  title: string
  type: EventType
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
}

const TYPE_STYLES: Record<EventType, { dot: string; badge: string; header: string }> = {
  practice: { dot: 'bg-blue-500',  badge: 'bg-blue-100 text-blue-700',   header: 'from-blue-500 to-blue-600' },
  race:     { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', header: 'from-green-500 to-green-600' },
  meeting:  { dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-700',   header: 'from-gray-400 to-gray-500' },
}

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getCalendarDays(year: number, month: number) {
  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()
  const days: { date: Date; current: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    days.push({ date: new Date(year, month - 1, daysInPrev - i), current: false })
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ date: new Date(year, month, d), current: true })
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++)
    days.push({ date: new Date(year, month + 1, d), current: false })
  return days
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = (h ?? 0) >= 12 ? 'PM' : 'AM'
  const hour = ((h ?? 0) % 12) || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

const EMPTY_FORM = { title: '', type: 'practice' as EventType, date: '', startTime: '09:00', endTime: '11:00', location: '', description: '' }

export default function CalendarPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const today = new Date()
  const [year, setYear]         = useState(today.getFullYear())
  const [month, setMonth]       = useState(today.getMonth())
  const [events, setEvents]     = useState<CalEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<CalEvent | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [userId, setUserId]     = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [myRsvp, setMyRsvp]     = useState<'yes'|'maybe'|'no'|null>(null)
  const [rsvps, setRsvps]       = useState<{ name: string; status: 'yes'|'maybe'|'no' }[]>([])
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setUserId(data.user.id) })
    loadEvents()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selected) { setMyRsvp(null); setRsvps([]); return }
    loadRsvps(selected.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id])

  // Navigate to a specific date/event from URL params (e.g. from dashboard home)
  useEffect(() => {
    const dateParam = searchParams.get('date')
    const eventId = searchParams.get('eventId')
    if (dateParam) {
      const d = new Date(dateParam + 'T00:00:00')
      setYear(d.getFullYear())
      setMonth(d.getMonth())
    }
    if (eventId && events.length > 0) {
      const ev = events.find(e => e.id === eventId)
      if (ev) setSelected(ev)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, events])

  async function loadEvents() {
    setLoading(true)
    const { data } = await supabase.from('events').select('id, title, type, start_at, end_at, location, description').order('start_at')
    setLoading(false)
    if (!data) return
    setEvents(data.map((row: any) => {
      const start = new Date(row.start_at)
      const end   = new Date(row.end_at)
      return { id: row.id, title: row.title, type: row.type as EventType,
        date: toDateStr(start), startTime: start.toTimeString().slice(0,5),
        endTime: end.toTimeString().slice(0,5), location: row.location ?? '', description: row.description ?? '' }
    }))
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setMonth(0);  setYear(y => y+1) } else setMonth(m => m+1) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string,string> = {}
    if (!form.title.trim()) errs['title'] = 'Title is required'
    if (!form.date) errs['date'] = 'Date is required'
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!userId) return
    setSaving(true)
    const startAt = new Date(`${form.date}T${form.startTime}`)
    const endAt   = new Date(`${form.date}T${form.endTime}`)
    const { data, error } = await supabase.from('events').insert({
      id: crypto.randomUUID(), title: form.title, type: form.type,
      start_at: startAt.toISOString(), end_at: endAt.toISOString(),
      location: form.location || null, description: form.description || null, created_by: userId,
    }).select().single()
    setSaving(false)
    if (!error && data) {
      setEvents(prev => [...prev, { id: data.id, title: data.title, type: data.type,
        date: form.date, startTime: form.startTime, endTime: form.endTime,
        location: form.location, description: form.description }])
      setShowCreate(false); setForm({ ...EMPTY_FORM })
    }
  }

  async function loadRsvps(eventId: string) {
    setRsvpLoading(true)
    const { data } = await supabase
      .from('rsvps')
      .select('status, user_id, users(name)')
      .eq('event_id', eventId)
    setRsvpLoading(false)
    if (!data) return
    const list = data.map((r: any) => ({ name: r.users?.name ?? 'Unknown', status: r.status as 'yes'|'maybe'|'no' }))
    setRsvps(list)
    if (userId) {
      const mine = data.find((r: any) => r.user_id === userId)
      setMyRsvp(mine ? mine.status : null)
    }
  }

  async function handleRsvp(status: 'yes'|'maybe'|'no') {
    if (!selected || !userId) return
    setMyRsvp(status)
    const existing = await supabase.from('rsvps').select('id').eq('event_id', selected.id).eq('user_id', userId).single()
    if (existing.data) {
      await supabase.from('rsvps').update({ status }).eq('id', existing.data.id)
    } else {
      await supabase.from('rsvps').insert({ id: crypto.randomUUID(), event_id: selected.id, user_id: userId, status })
    }
    loadRsvps(selected.id)
  }

  async function handleDelete(id: string) {
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(ev => ev.id !== id)); setSelected(null)
  }

  const days = getCalendarDays(year, month)
  const inputCls = 'w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-3 py-2 text-sm text-[rgb(var(--text))] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500'

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8 flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-[rgb(var(--text))]">Calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            {(Object.entries(TYPE_STYLES) as [EventType, typeof TYPE_STYLES[EventType]][]).map(([type, s]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))] capitalize">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />{type}
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => { setForm({...EMPTY_FORM}); setErrors({}); setShowCreate(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-[rgb(var(--surface))]">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[rgb(var(--border))] shrink-0">
          <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-[rgb(var(--bg-secondary))]">
            <ChevronLeft className="h-5 w-5 text-[rgb(var(--text))]" />
          </button>
          <h2 className="font-semibold text-[rgb(var(--text))] text-lg">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-[rgb(var(--bg-secondary))]">
            <ChevronRight className="h-5 w-5 text-[rgb(var(--text))]" />
          </button>
        </div>
        <div className="grid grid-cols-7 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] shrink-0">
          {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-[rgb(var(--text-muted))]">{d}</div>)}
        </div>
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-[rgb(var(--border))] overflow-hidden" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
            {days.map(({ date, current }, i) => {
              const ds = toDateStr(date)
              const dayEvents = events.filter(ev => ev.date === ds)
              const isToday = ds === toDateStr(today)
              return (
                <div key={i}
                  onClick={() => { if (current) { setForm({...EMPTY_FORM, date: toDateStr(date)}); setErrors({}); setShowCreate(true) } }}
                  className={cn('p-2 overflow-hidden transition-colors',
                    current ? 'cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-950/30' : 'bg-[rgb(var(--bg-secondary))] opacity-40')}>
                  <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                    isToday ? 'bg-brand-600 text-white font-bold' : 'text-[rgb(var(--text))]')}>
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 3).map(ev => (
                      <button key={ev.id} onClick={e => { e.stopPropagation(); setSelected(ev) }}
                        className={cn('w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium', TYPE_STYLES[ev.type].badge)}>
                        {ev.title}
                      </button>
                    ))}
                    {dayEvents.length > 3 && <p className="text-xs text-[rgb(var(--text-muted))] px-1">+{dayEvents.length - 3} more</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[rgb(var(--surface))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className={cn('bg-gradient-to-r px-6 py-6 text-white', TYPE_STYLES[selected.type].header)}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium capitalize">{selected.type}</span>
                  <h3 className="mt-2 text-xl font-bold">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-white/20"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
                <Clock className="h-4 w-4" />{selected.date} · {formatTime(selected.startTime)}–{formatTime(selected.endTime)}
              </div>
              {selected.location && <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]"><MapPin className="h-4 w-4" />{selected.location}</div>}
              {selected.description && <p className="text-sm text-[rgb(var(--text))] leading-relaxed">{selected.description}</p>}
              <div className="border-t border-[rgb(var(--border))] pt-4">
                <p className="mb-3 text-sm font-medium text-[rgb(var(--text))]">Are you going?</p>
                <div className="flex gap-2">
                  {(['yes','maybe','no'] as const).map(s => (
                    <button key={s} onClick={() => handleRsvp(s)}
                      className={cn('flex-1 rounded-lg border-2 py-2 text-sm font-medium capitalize transition',
                        s==='yes'   && (myRsvp==='yes'   ? 'border-green-500 bg-green-500 text-white'  : 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'),
                        s==='maybe' && (myRsvp==='maybe' ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'),
                        s==='no'    && (myRsvp==='no'    ? 'border-red-500 bg-red-500 text-white'       : 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'))}>
                      {s==='yes' ? '✓ Going' : s==='maybe' ? '? Maybe' : "✕ Can't go"}
                    </button>
                  ))}
                </div>
                {rsvpLoading ? (
                  <div className="mt-3 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--text-muted))]" /></div>
                ) : rsvps.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {(['yes','maybe','no'] as const).filter(s => rsvps.some(r => r.status === s)).map(s => (
                      <div key={s}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))] mb-1">
                          {s==='yes' ? `Going (${rsvps.filter(r=>r.status==='yes').length})` : s==='maybe' ? `Maybe (${rsvps.filter(r=>r.status==='maybe').length})` : `Can't go (${rsvps.filter(r=>r.status==='no').length})`}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rsvps.filter(r => r.status === s).map((r, i) => (
                            <span key={i} className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium',
                              s==='yes' ? 'bg-green-100 text-green-700' : s==='maybe' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-50 text-red-600')}>
                              {r.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete(selected.id)} className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50">Delete Event</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-[rgb(var(--surface))] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--text))]">New Event</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-full p-1 hover:bg-[rgb(var(--bg-secondary))]"><X className="h-5 w-5 text-[rgb(var(--text-muted))]" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                  className={cn(inputCls, errors['title'] && 'border-red-400')} placeholder="e.g. Thursday Practice" />
                {errors['title'] && <p className="mt-1 text-xs text-red-500">{errors['title']}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as EventType}))} className={inputCls}>
                  <option value="practice">Practice</option><option value="race">Race</option><option value="meeting">Meeting</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                  className={cn(inputCls, errors['date'] && 'border-red-400')} />
                {errors['date'] && <p className="mt-1 text-xs text-red-500">{errors['date']}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Start</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({...f, startTime: e.target.value}))} className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">End</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({...f, endTime: e.target.value}))} className={inputCls} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputCls} placeholder="e.g. Annadel State Park" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                  rows={3} className={cn(inputCls, 'resize-none')} placeholder="Optional details..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-lg border border-[rgb(var(--border))] py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))]">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  function handleDayClick(date: Date) {
    setForm({ ...EMPTY_FORM, date: toDateStr(date) }); setErrors({}); setShowCreate(true)
  }
}
