'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Plus, Trash2, X, ChevronRight, Bike, GripVertical, Edit2, Check } from 'lucide-react'
import Papa from 'papaparse'
import { cn } from '@a-team/utils'

interface Rider {
  id: string
  name: string
  rawTime: string   // e.g. "4:32" or "272"
  seconds: number   // normalized for sorting
}

interface RideGroup {
  id: string
  name: string
  color: string
  riderIds: string[]
}

const DEFAULT_COLORS = [
  'bg-brand-100 text-brand-700 border-brand-300',
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-green-100 text-green-700 border-green-300',
  'bg-yellow-100 text-yellow-700 border-yellow-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-pink-100 text-pink-700 border-pink-300',
]

const STORAGE_KEY = 'ride_groups_v1'

function parseTime(raw: string): number {
  const s = raw.trim()
  if (s.includes(':')) {
    const [min, sec] = s.split(':').map(Number)
    return (min ?? 0) * 60 + (sec ?? 0)
  }
  return parseFloat(s) || 0
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function autoGroup(riders: Rider[], groupCount: number): RideGroup[] {
  const sorted = [...riders].sort((a, b) => a.seconds - b.seconds)
  const chunkSize = Math.ceil(sorted.length / groupCount)
  const groupNames = ['A', 'B', 'C', 'D', 'E', 'F']
  return Array.from({ length: groupCount }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Group ${groupNames[i] ?? String.fromCharCode(65 + i)}`,
    color: DEFAULT_COLORS[i % DEFAULT_COLORS.length]!,
    riderIds: sorted.slice(i * chunkSize, (i + 1) * chunkSize).map(r => r.id),
  }))
}

export default function RideGroupsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [riders, setRiders] = useState<Rider[]>([])
  const [groups, setGroups] = useState<RideGroup[]>([])
  const [groupCount, setGroupCount] = useState(3)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [movingRider, setMovingRider] = useState<{ riderId: string; fromGroupId: string } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { riders: r, groups: g } = JSON.parse(stored)
      setRiders(r ?? [])
      setGroups(g ?? [])
    }
  }, [])

  function save(r: Rider[], g: RideGroup[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ riders: r, groups: g }))
    setRiders(r)
    setGroups(g)
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImportError(null)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = (results.meta.fields ?? []).map(h => h.toLowerCase())
        const nameCol = results.meta.fields?.find((_, i) => ['name', 'rider', 'athlete', 'first name', 'full name'].includes(headers[i]!))
        const timeCol = results.meta.fields?.find((_, i) => ['time', 'result', 'finish', 'duration', 'seconds'].includes(headers[i]!))

        if (!nameCol) { setImportError('Could not find a Name column. Expecting: "Name" or "Rider"'); return }
        if (!timeCol) { setImportError('Could not find a Time column. Expecting: "Time" or "Result"'); return }

        const newRiders: Rider[] = results.data
          .filter(row => row[nameCol]?.trim())
          .map(row => ({
            id: crypto.randomUUID(),
            name: row[nameCol]!.trim(),
            rawTime: row[timeCol]?.trim() ?? '0',
            seconds: parseTime(row[timeCol] ?? '0'),
          }))

        const newGroups = autoGroup(newRiders, groupCount)
        save(newRiders, newGroups)
        if (fileRef.current) fileRef.current.value = ''
      },
      error: (err) => setImportError(err.message),
    })
  }

  function handleRegroup() {
    if (riders.length === 0) return
    save(riders, autoGroup(riders, groupCount))
  }

  function startEditGroupName(group: RideGroup) {
    setEditingGroupId(group.id)
    setEditingGroupName(group.name)
  }

  function saveGroupName() {
    if (!editingGroupId) return
    const updated = groups.map(g => g.id === editingGroupId ? { ...g, name: editingGroupName } : g)
    save(riders, updated)
    setEditingGroupId(null)
  }

  function deleteGroup(groupId: string) {
    const group = groups.find(g => g.id === groupId)
    if (!group) return
    // Move riders back to unassigned (first group) or delete the group
    const remaining = groups.filter(g => g.id !== groupId)
    if (remaining.length > 0) {
      remaining[0]!.riderIds = [...remaining[0]!.riderIds, ...group.riderIds]
    }
    save(riders, remaining)
  }

  function addGroup() {
    const idx = groups.length
    const names = ['A', 'B', 'C', 'D', 'E', 'F']
    const newGroup: RideGroup = {
      id: crypto.randomUUID(),
      name: `Group ${names[idx] ?? String.fromCharCode(65 + idx)}`,
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length]!,
      riderIds: [],
    }
    save(riders, [...groups, newGroup])
  }

  function moveRider(riderId: string, fromGroupId: string, toGroupId: string) {
    if (fromGroupId === toGroupId) return
    const updated = groups.map(g => {
      if (g.id === fromGroupId) return { ...g, riderIds: g.riderIds.filter(id => id !== riderId) }
      if (g.id === toGroupId) return { ...g, riderIds: [...g.riderIds, riderId] }
      return g
    })
    save(riders, updated)
    setMovingRider(null)
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY)
    setRiders([])
    setGroups([])
  }

  const unassignedRiders = riders.filter(r => !groups.some(g => g.riderIds.includes(r.id)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Ride Groups</h1>
          <p className="text-sm text-[rgb(var(--text-muted))]">
            {riders.length > 0
              ? `${riders.length} riders across ${groups.length} group${groups.length !== 1 ? 's' : ''}`
              : 'Import time trial results to auto-generate ride groups'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {riders.length > 0 && (
            <>
              <button onClick={addGroup}
                className="inline-flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-[rgb(var(--bg-secondary))]">
                <Plus className="h-4 w-4" /> Add Group
              </button>
              <button onClick={clearAll}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                <Trash2 className="h-4 w-4" /> Clear All
              </button>
            </>
          )}
          <button onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700">
            <Upload className="h-4 w-4" /> Import Time Trial CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
        </div>
      </div>

      {/* Import error */}
      {importError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700">
          <X className="h-4 w-4 shrink-0" />
          <p className="flex-1">{importError}</p>
          <button onClick={() => setImportError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {riders.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-16 text-center">
          <Bike className="mx-auto h-12 w-12 text-[rgb(var(--border))]" />
          <p className="mt-4 text-lg font-semibold text-[rgb(var(--text))]">No ride groups yet</p>
          <p className="mt-1 text-sm text-[rgb(var(--text-muted))] max-w-sm mx-auto">
            Import a CSV with rider names and time trial times. Riders will be automatically sorted and grouped fastest to slowest.
          </p>
          <div className="mt-6 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] p-4 text-left max-w-xs mx-auto">
            <p className="text-xs font-semibold text-[rgb(var(--text-muted))] mb-2 uppercase tracking-wide">Expected CSV format</p>
            <p className="font-mono text-xs text-[rgb(var(--text))]">Name,Time</p>
            <p className="font-mono text-xs text-[rgb(var(--text-muted))]">Alex Smith,4:32</p>
            <p className="font-mono text-xs text-[rgb(var(--text-muted))]">Jordan Lee,5:01</p>
            <p className="font-mono text-xs text-[rgb(var(--text-muted))]">Casey Brown,5:45</p>
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
        </div>
      ) : (
        <>
          {/* Regroup controls */}
          <div className="flex items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-5 py-3">
            <span className="text-sm font-medium text-[rgb(var(--text))]">Auto-group into</span>
            <div className="flex gap-1">
              {[2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setGroupCount(n)}
                  className={cn('h-8 w-8 rounded-lg text-sm font-medium transition-colors',
                    groupCount === n ? 'bg-brand-600 text-white' : 'border border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]')}>
                  {n}
                </button>
              ))}
            </div>
            <span className="text-sm text-[rgb(var(--text-muted))]">groups</span>
            <button onClick={handleRegroup}
              className="rounded-lg border border-brand-300 bg-brand-50 dark:bg-brand-950/30 px-4 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-950/50">
              Re-generate
            </button>
            {movingRider && (
              <span className="ml-auto text-sm text-brand-600 dark:text-brand-400 animate-pulse">
                Click a group to move rider there
              </span>
            )}
          </div>

          {/* Groups */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map(group => {
              const groupRiders = group.riderIds
                .map(id => riders.find(r => r.id === id))
                .filter(Boolean) as Rider[]
              const fastest = groupRiders.reduce((min, r) => r.seconds < min ? r.seconds : min, Infinity)
              const slowest = groupRiders.reduce((max, r) => r.seconds > max ? r.seconds : max, 0)
              const isMovingTarget = movingRider !== null && movingRider.fromGroupId !== group.id

              return (
                <div key={group.id}
                  onClick={() => {
                    if (movingRider && isMovingTarget) moveRider(movingRider.riderId, movingRider.fromGroupId, group.id)
                  }}
                  className={cn(
                    'rounded-xl border bg-[rgb(var(--surface))] overflow-hidden transition-all',
                    isMovingTarget ? 'border-brand-400 ring-2 ring-brand-300 cursor-pointer shadow-md' : 'border-[rgb(var(--border))]'
                  )}>
                  {/* Group header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]">
                    <div className="flex items-center gap-2">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold border', group.color)}>
                        {groupRiders.length}
                      </span>
                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editingGroupName}
                            onChange={e => setEditingGroupName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveGroupName(); if (e.key === 'Escape') setEditingGroupId(null) }}
                            className="rounded border border-brand-300 bg-[rgb(var(--surface))] px-2 py-0.5 text-sm font-semibold text-[rgb(var(--text))] focus:outline-none w-32"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                          <button onClick={e => { e.stopPropagation(); saveGroupName() }}
                            className="rounded p-0.5 text-green-500 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-semibold text-sm text-[rgb(var(--text))]">{group.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); startEditGroupName(group) }}
                        className="rounded p-1 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteGroup(group.id) }}
                        className="rounded p-1 text-[rgb(var(--text-muted))] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Time range */}
                  {groupRiders.length > 0 && (
                    <div className="px-4 py-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]/50">
                      <p className="text-xs text-[rgb(var(--text-muted))]">
                        {formatTime(fastest)} – {formatTime(slowest)}
                        <span className="ml-2 opacity-60">range</span>
                      </p>
                    </div>
                  )}

                  {/* Riders */}
                  <div className="divide-y divide-[rgb(var(--border))]">
                    {groupRiders.length === 0 ? (
                      <p className="px-4 py-6 text-center text-sm text-[rgb(var(--text-muted))]">No riders</p>
                    ) : (
                      groupRiders.map((rider, idx) => {
                        const isBeingMoved = movingRider?.riderId === rider.id
                        return (
                          <div key={rider.id}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2.5 hover:bg-[rgb(var(--bg-secondary))] transition-colors',
                              isBeingMoved && 'bg-brand-50 dark:bg-brand-950/30'
                            )}>
                            <span className="text-xs text-[rgb(var(--text-muted))] w-5 shrink-0">{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[rgb(var(--text))] truncate">{rider.name}</p>
                            </div>
                            <span className="font-mono text-xs text-[rgb(var(--text-muted))] shrink-0">{rider.rawTime}</span>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                if (movingRider?.riderId === rider.id) {
                                  setMovingRider(null)
                                } else {
                                  setMovingRider({ riderId: rider.id, fromGroupId: group.id })
                                }
                              }}
                              title="Move to another group"
                              className={cn('rounded p-1 transition-colors shrink-0',
                                movingRider?.riderId === rider.id
                                  ? 'text-brand-500 bg-brand-50 dark:bg-brand-950/30'
                                  : 'text-[rgb(var(--text-muted))] hover:text-brand-500 hover:bg-[rgb(var(--bg-secondary))]'
                              )}>
                              <GripVertical className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Unassigned */}
          {unassignedRiders.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 p-4">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                {unassignedRiders.length} unassigned rider{unassignedRiders.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {unassignedRiders.map(r => (
                  <span key={r.id} className="rounded-full border border-yellow-300 bg-white dark:bg-yellow-950/30 px-3 py-1 text-sm text-yellow-800 dark:text-yellow-300">
                    {r.name} <span className="font-mono opacity-60">{r.rawTime}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
