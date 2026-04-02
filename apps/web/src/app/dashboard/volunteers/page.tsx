'use client'

import { useState } from 'react'
import { HandHeart, Users, CheckCircle, Plus, X, Trash2 } from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'

interface VolSlot {
  id: string
  eventName: string
  eventDate: string
  name: string
  capacity: number
  signups: string[] // user ids/names
}

export default function VolunteersPage() {
  const { role } = useRole()
  const canManage = role === 'admin' || role === 'coach'

  const [slots, setSlots] = useState<VolSlot[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ eventName: '', eventDate: '', name: '', capacity: 1 })

  const isSigned = (slot: VolSlot) => slot.signups.includes('me')
  const isFull = (slot: VolSlot) => slot.signups.length >= slot.capacity

  function toggleSignup(id: string) {
    setSlots(prev => prev.map(s => {
      if (s.id !== id) return s
      if (isSigned(s)) return { ...s, signups: s.signups.filter(u => u !== 'me') }
      if (isFull(s)) return s
      return { ...s, signups: [...s.signups, 'me'] }
    }))
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.eventName.trim()) return
    setSlots(prev => [...prev, { id: crypto.randomUUID(), ...form, signups: [] }])
    setForm({ eventName: '', eventDate: '', name: '', capacity: 1 })
    setShowAdd(false)
  }

  function deleteSlot(id: string) {
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  // Group by event
  const eventMap = slots.reduce<Record<string, VolSlot[]>>((acc, slot) => {
    const key = `${slot.eventName}__${slot.eventDate}`
    if (!acc[key]) acc[key] = []
    acc[key]!.push(slot)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteering</h1>
          <p className="text-sm text-gray-500">Sign up to help at events</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus className="h-4 w-4" /> Add Slot
          </button>
        )}
      </div>

      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <HandHeart className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-500">No volunteer slots yet</p>
          {canManage && <p className="text-sm text-gray-400">Add slots for upcoming events</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(eventMap).map(([key, eventSlots]) => {
            const [eventName, eventDate] = key.split('__')
            return (
              <div key={key} className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">{eventName}</h2>
                  {eventDate && <p className="text-sm text-gray-500">{eventDate}</p>}
                </div>
                <div className="divide-y divide-gray-100">
                  {eventSlots.map(slot => {
                    const signed = isSigned(slot)
                    const full = isFull(slot) && !signed

                    return (
                      <div key={slot.id} className="flex items-center justify-between px-6 py-4 group">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${full ? 'bg-green-50' : 'bg-brand-50'}`}>
                            <HandHeart className={`h-5 w-5 ${full ? 'text-green-500' : 'text-brand-500'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{slot.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Users className="h-3 w-3" />
                              {slot.signups.length} / {slot.capacity} filled
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {signed ? (
                            <button onClick={() => toggleSignup(slot.id)} className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 hover:bg-green-100">
                              <CheckCircle className="h-4 w-4" /> Signed up
                            </button>
                          ) : full ? (
                            <span className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">Full</span>
                          ) : (
                            <button onClick={() => toggleSignup(slot.id)} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
                              Sign Up
                            </button>
                          )}
                          {canManage && (
                            <button onClick={() => deleteSlot(slot.id)} className="hidden group-hover:flex rounded-md p-2 text-gray-300 hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
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

      {/* Add slot modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Volunteer Slot</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                <input value={form.eventName} onChange={e => setForm(f => ({ ...f, eventName: e.target.value }))} required
                  placeholder="e.g. North Bay Regional Race"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <input type="date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Slot Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="e.g. Pit Zone Marshal"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white">Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
