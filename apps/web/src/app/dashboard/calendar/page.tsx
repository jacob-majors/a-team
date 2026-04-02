'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, MapPin, Clock } from 'lucide-react'
import { cn } from '@a-team/utils'

type EventType = 'practice' | 'race' | 'meeting'

interface CalEvent {
  id: string
  title: string
  type: EventType
  date: string // YYYY-MM-DD
  startTime: string
  endTime: string
  location: string
  description: string
}

const TYPE_STYLES: Record<EventType, { dot: string; badge: string; header: string }> = {
  practice: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', header: 'from-blue-500 to-blue-600' },
  race: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', header: 'from-green-500 to-green-600' },
  meeting: { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700', header: 'from-gray-400 to-gray-500' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const days: { date: Date; current: boolean }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ date: new Date(year, month - 1, daysInPrev - i), current: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), current: true })
  }
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), current: false })
  }
  return days
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const EMPTY_FORM = { title: '', type: 'practice' as EventType, date: '', startTime: '09:00', endTime: '11:00', location: '', description: '' }

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [events, setEvents] = useState<CalEvent[]>([])
  const [selected, setSelected] = useState<CalEvent | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const days = getCalendarDays(year, month)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDayClick(date: Date) {
    setForm({ ...EMPTY_FORM, date: toDateStr(date) })
    setErrors({})
    setShowCreate(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e['title'] = 'Title is required'
    if (!form.date) e['date'] = 'Date is required'
    if (!form.startTime) e['startTime'] = 'Start time is required'
    if (!form.endTime) e['endTime'] = 'End time is required'
    return e
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    const newEvent: CalEvent = { ...form, id: crypto.randomUUID() }
    setEvents(prev => [...prev, newEvent])
    setShowCreate(false)
    setForm({ ...EMPTY_FORM })
  }

  function handleDelete(id: string) {
    setEvents(prev => prev.filter(ev => ev.id !== id))
    setSelected(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500">Click any day to add an event</p>
        </div>
        <button
          onClick={() => { setForm({ ...EMPTY_FORM }); setErrors({}); setShowCreate(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" /> Add Event
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {(Object.entries(TYPE_STYLES) as [EventType, (typeof TYPE_STYLES)[EventType]][]).map(([type, s]) => (
          <div key={type} className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
            <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
            {type}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <button onClick={prevMonth} className="rounded-lg p-1.5 hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="font-semibold text-gray-900 text-lg">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="rounded-lg p-1.5 hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
          {days.map(({ date, current }, i) => {
            const ds = toDateStr(date)
            const dayEvents = events.filter(ev => ev.date === ds)
            const isToday = ds === toDateStr(today)

            return (
              <div
                key={i}
                onClick={() => current && handleDayClick(date)}
                className={cn(
                  'min-h-[80px] p-2 transition-colors',
                  current ? 'cursor-pointer hover:bg-orange-50' : 'bg-gray-50',
                  !current && 'opacity-40'
                )}
              >
                <span className={cn(
                  'inline-flex h-7 w-7 items-center justify-center rounded-full text-sm',
                  isToday ? 'bg-orange-500 text-white font-bold' : 'text-gray-700'
                )}>
                  {date.getDate()}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map(ev => (
                    <button
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); setSelected(ev) }}
                      className={cn(
                        'w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium',
                        TYPE_STYLES[ev.type].badge
                      )}
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="text-xs text-gray-400 px-1">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className={cn('bg-gradient-to-r px-6 py-6 text-white', TYPE_STYLES[selected.type].header)}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium capitalize">{selected.type}</span>
                  <h3 className="mt-2 text-xl font-bold">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-white/20">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                {selected.date} · {selected.startTime}–{selected.endTime}
              </div>
              {selected.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {selected.location}
                </div>
              )}
              {selected.description && (
                <p className="text-sm text-gray-700 leading-relaxed">{selected.description}</p>
              )}

              {/* RSVP */}
              <div className="border-t border-gray-100 pt-4">
                <p className="mb-3 text-sm font-medium text-gray-700">Are you going?</p>
                <div className="flex gap-2">
                  {(['yes', 'maybe', 'no'] as const).map(s => (
                    <button key={s} className={cn(
                      'flex-1 rounded-lg border-2 py-2 text-sm font-medium capitalize transition',
                      s === 'yes' && 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100',
                      s === 'maybe' && 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
                      s === 'no' && 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100',
                    )}>
                      {s === 'yes' ? '✓ Going' : s === 'maybe' ? '? Maybe' : '✕ Can\'t go'}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleDelete(selected.id)}
                className="w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create event modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">New Event</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-full p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={cn('w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400', errors['title'] ? 'border-red-400' : 'border-gray-300')}
                  placeholder="e.g. Thursday Practice"
                />
                {errors['title'] && <p className="mt-1 text-xs text-red-500">{errors['title']}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as EventType }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                >
                  <option value="practice">Practice</option>
                  <option value="race">Race</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className={cn('w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400', errors['date'] ? 'border-red-400' : 'border-gray-300')}
                />
                {errors['date'] && <p className="mt-1 text-xs text-red-500">{errors['date']}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End *</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
                  placeholder="e.g. Annadel State Park"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
                  placeholder="Optional details..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
