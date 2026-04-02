'use client'

import { useState, useRef } from 'react'
import { Search, CheckCircle, XCircle, Upload, X, Plus, AlertCircle, ArrowRight } from 'lucide-react'
import Papa from 'papaparse'
import { cn } from '@a-team/utils'

type Role = 'athlete' | 'coach' | 'parent' | 'admin'

interface Member {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  role: Role
  isAdmin: boolean
  isGuardian: boolean
  isRacer: boolean
  isHSAthlete: boolean
  isDevAthlete: boolean
  isGrit: boolean
  isTeamCaptain: boolean
  isWindsorHS: boolean
  hasTrainingPeaks: boolean
  isChild: boolean
  otherRole: string
  duesPaid: boolean
  duesAmount?: number
  pitZoneStatus: string
  notes: string
  grade: string
}

const ROLE_STYLES: Record<Role, string> = {
  athlete: 'bg-orange-100 text-orange-700',
  coach: 'bg-blue-100 text-blue-700',
  parent: 'bg-purple-100 text-purple-700',
  admin: 'bg-gray-100 text-gray-700',
}

const GROUP_LABELS: { key: keyof Member; label: string; color: string }[] = [
  { key: 'isRacer',          label: 'Racer',          color: 'bg-green-100 text-green-700' },
  { key: 'isHSAthlete',      label: 'HS Athlete',     color: 'bg-blue-100 text-blue-700' },
  { key: 'isDevAthlete',     label: 'Devo',           color: 'bg-yellow-100 text-yellow-700' },
  { key: 'isGrit',           label: 'GRiT',           color: 'bg-pink-100 text-pink-700' },
  { key: 'isTeamCaptain',    label: 'Team Captain',   color: 'bg-purple-100 text-purple-700' },
  { key: 'isWindsorHS',      label: 'Windsor HS',     color: 'bg-teal-100 text-teal-700' },
  { key: 'hasTrainingPeaks', label: 'Training Peaks', color: 'bg-indigo-100 text-indigo-700' },
  { key: 'isChild',          label: 'Child',          color: 'bg-orange-100 text-orange-700' },
]

// App fields the user can map CSV columns to
interface AppField {
  key: string
  label: string
  description: string
  required?: boolean
  boolean?: boolean
}

const APP_FIELDS: AppField[] = [
  { key: 'firstName',        label: 'First Name',      description: 'Given name',           required: true },
  { key: 'lastName',         label: 'Last Name',        description: 'Family name' },
  { key: 'email',            label: 'Email',            description: 'Email address' },
  { key: 'phone',            label: 'Phone',            description: 'Phone number' },
  { key: 'grade',            label: 'Grade',            description: 'School grade' },
  { key: 'otherRole',        label: 'Other Title/Role', description: 'Extra role label' },
  { key: 'duesPaid',         label: 'Dues Paid',        description: 'Boolean (yes/x/1/✓)',  boolean: true },
  { key: 'duesAmount',       label: 'Dues Amount',      description: 'Numeric dollar amount' },
  { key: 'pitZoneStatus',    label: 'Pit Zone Status',  description: 'Pit zone text' },
  { key: 'notes',            label: 'Notes',            description: 'Free text notes' },
  { key: 'isAdmin',          label: 'Full Admin',       description: 'Boolean flag',          boolean: true },
  { key: 'isGuardian',       label: 'Guardian',         description: 'Boolean flag',          boolean: true },
  { key: 'isRacer',          label: 'Racer',            description: 'Boolean flag',          boolean: true },
  { key: 'isHSAthlete',      label: 'HS Athlete',       description: 'Boolean flag',          boolean: true },
  { key: 'isDevAthlete',     label: 'Devo Athlete',     description: 'Boolean flag',          boolean: true },
  { key: 'isGrit',           label: 'GRiT',             description: 'Boolean flag',          boolean: true },
  { key: 'isTeamCaptain',    label: 'Team Captain',     description: 'Boolean flag',          boolean: true },
  { key: 'isWindsorHS',      label: 'Windsor HS',       description: 'Boolean flag',          boolean: true },
  { key: 'hasTrainingPeaks', label: 'Training Peaks',   description: 'Boolean flag',          boolean: true },
  { key: 'isChild',          label: 'Child',            description: 'Boolean flag',          boolean: true },
]

// Try to auto-guess mapping from CSV headers
function guessMapping(headers: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  const lower = headers.map(h => h.toLowerCase().trim())

  const guesses: [string, string[]][] = [
    ['firstName',        ['first name', 'firstname', 'first_name', 'given name']],
    ['lastName',         ['last name', 'lastname', 'last_name', 'family name', 'surname']],
    ['email',            ['email', 'email address', 'e-mail']],
    ['phone',            ['phone', 'phone number', 'mobile', 'cell']],
    ['grade',            ['grade', 'school grade', 'year']],
    ['otherRole',        ['other title/role', 'other role', 'title', 'role']],
    ['duesPaid',         ['dues paid', 'dues_paid', 'paid']],
    ['duesAmount',       ['dues amount', 'dues_amount', 'amount']],
    ['pitZoneStatus',    ['pit zone status', 'pit_zone_status', 'pit zone']],
    ['notes',            ['notes', 'note', 'comments']],
    ['isAdmin',          ['full admin', 'admin']],
    ['isGuardian',       ['guardian', 'parent', 'guardian/parent']],
    ['isRacer',          ['racers', 'racer']],
    ['isHSAthlete',      ['hs athletes', 'hs athlete', 'high school']],
    ['isDevAthlete',     ['devo athletes', 'devo athlete', 'devo']],
    ['isGrit',           ['grit']],
    ['isTeamCaptain',    ['team captains', 'team captain', 'captain']],
    ['isWindsorHS',      ['windsor hs', 'windsor']],
    ['hasTrainingPeaks', ['training peaks', 'trainingpeaks']],
    ['isChild',          ['child', 'kid']],
  ]

  for (const [fieldKey, candidates] of guesses) {
    for (const candidate of candidates) {
      const idx = lower.indexOf(candidate)
      if (idx !== -1) {
        map[fieldKey] = headers[idx]!
        break
      }
    }
  }
  return map
}

function isTruthy(val: string | undefined) {
  return ['true', 'yes', '1', 'x', '✓', 'check', 'checked'].includes((val ?? '').toLowerCase().trim())
}

function deriveRole(row: Partial<Member>): Role {
  if (row.isAdmin) return 'admin'
  if (row.isGuardian) return 'parent'
  if (row.isRacer || row.isHSAthlete || row.isDevAthlete || row.isGrit) return 'athlete'
  return 'athlete'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const EMPTY_FORM: Omit<Member, 'id' | 'name'> = {
  firstName: '', lastName: '', email: '', phone: '', role: 'athlete',
  isAdmin: false, isGuardian: false, isRacer: false, isHSAthlete: false,
  isDevAthlete: false, isGrit: false, isTeamCaptain: false,
  isWindsorHS: false, hasTrainingPeaks: false, isChild: false,
  otherRole: '', duesPaid: false, pitZoneStatus: '', notes: '', grade: '',
}

type ImportStep = 'upload' | 'map' | 'done'

export default function RosterPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [importResult, setImportResult] = useState<{ added: number; dupes: number; errors: string[] } | null>(null)
  const [editMode, setEditMode] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // CSV import wizard state
  const [importStep, setImportStep] = useState<ImportStep>('upload')
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([])
  const [columnMap, setColumnMap] = useState<Record<string, string>>({}) // appField -> csvHeader

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || m.role === roleFilter
    const matchGroup = !groupFilter || (m[groupFilter as keyof Member] === true)
    return matchSearch && matchRole && matchGroup
  })

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? []
        setCsvHeaders(headers)
        setCsvRows(results.data)
        setColumnMap(guessMapping(headers))
        setImportStep('map')
        if (fileRef.current) fileRef.current.value = ''
      },
      error: (err) => {
        setImportResult({ added: 0, dupes: 0, errors: [err.message] })
        setShowImport(false)
      },
    })
  }

  function applyImport() {
    const existingNames = new Set(members.map(m => m.name.toLowerCase().trim()))
    const added: Member[] = []
    const dupes: string[] = []
    const errors: string[] = []

    const get = (row: Record<string, string>, fieldKey: string) =>
      columnMap[fieldKey] ? row[columnMap[fieldKey]!] : undefined

    csvRows.forEach((row, i) => {
      const firstName = (get(row, 'firstName') ?? '').trim()
      const lastName  = (get(row, 'lastName')  ?? '').trim()
      const fullName  = [firstName, lastName].filter(Boolean).join(' ')

      if (!fullName) { errors.push(`Row ${i + 2}: missing name`); return }
      if (existingNames.has(fullName.toLowerCase())) { dupes.push(fullName); return }
      existingNames.add(fullName.toLowerCase())

      const partial: Partial<Member> = {
        isAdmin:          isTruthy(get(row, 'isAdmin')),
        isGuardian:       isTruthy(get(row, 'isGuardian')),
        isRacer:          isTruthy(get(row, 'isRacer')),
        isHSAthlete:      isTruthy(get(row, 'isHSAthlete')),
        isDevAthlete:     isTruthy(get(row, 'isDevAthlete')),
        isGrit:           isTruthy(get(row, 'isGrit')),
        isTeamCaptain:    isTruthy(get(row, 'isTeamCaptain')),
        isWindsorHS:      isTruthy(get(row, 'isWindsorHS')),
        hasTrainingPeaks: isTruthy(get(row, 'hasTrainingPeaks')),
        isChild:          isTruthy(get(row, 'isChild')),
        otherRole:        get(row, 'otherRole') ?? '',
      }

      added.push({
        id: crypto.randomUUID(),
        firstName, lastName, name: fullName,
        email:         get(row, 'email')         ?? '',
        phone:         get(row, 'phone')         ?? '',
        grade:         get(row, 'grade')         ?? '',
        duesPaid:      isTruthy(get(row, 'duesPaid')),
        duesAmount:    get(row, 'duesAmount') ? Number(get(row, 'duesAmount')) : undefined,
        pitZoneStatus: get(row, 'pitZoneStatus') ?? '',
        notes:         get(row, 'notes')         ?? '',
        role: deriveRole(partial),
        ...partial,
      } as Member)
    })

    setMembers(prev => [...prev, ...added])
    setImportResult({ added: added.length, dupes: dupes.length, errors })
    setShowImport(false)
    setImportStep('upload')
    setCsvHeaders([])
    setCsvRows([])
    setColumnMap({})
  }

  function closeImport() {
    setShowImport(false)
    setImportStep('upload')
    setCsvHeaders([])
    setCsvRows([])
    setColumnMap({})
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName.trim()) return
    const name = [form.firstName, form.lastName].filter(Boolean).join(' ')
    const newMember: Member = { ...form, id: crypto.randomUUID(), name, role: deriveRole({ ...form }) }
    setMembers(prev => [...prev, newMember])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  function handleUpdateSelected() {
    if (!selected) return
    const updated = { ...selected, name: [selected.firstName, selected.lastName].filter(Boolean).join(' '), role: deriveRole(selected) }
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
    setSelected(updated)
    setEditMode(false)
  }

  function handleDeleteSelected() {
    if (!selected) return
    setMembers(prev => prev.filter(m => m.id !== selected.id))
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Roster</h1>
          <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setImportStep('upload'); setShowImport(true) }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button onClick={() => { setForm({ ...EMPTY_FORM }); setShowAdd(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <AlertCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-green-800">
              Import complete — {importResult.added} added, {importResult.dupes} duplicate{importResult.dupes !== 1 ? 's' : ''} skipped
            </p>
            {importResult.errors.map((err, i) => <p key={i} className="text-red-600 mt-1">{err}</p>)}
          </div>
          <button onClick={() => setImportResult(null)}><X className="h-4 w-4 text-green-500" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none">
          <option value="">All roles</option>
          <option value="athlete">Athletes</option>
          <option value="parent">Guardians</option>
          <option value="admin">Admins</option>
        </select>
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none">
          <option value="">All groups</option>
          {GROUP_LABELS.map(g => <option key={g.key as string} value={g.key as string}>{g.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-medium text-gray-500">No members yet</p>
          <p className="text-sm text-gray-400 mt-1">Import a CSV or add members manually</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Groups</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Dues</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Pit Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(member => (
                  <tr key={member.id} onClick={() => { setSelected(member); setEditMode(false) }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', ROLE_STYLES[member.role])}>
                              {member.role === 'parent' ? 'Guardian' : member.role}
                            </span>
                            {member.otherRole && <span className="text-xs text-gray-400">{member.otherRole}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {GROUP_LABELS.filter(g => member[g.key] === true).map(g => (
                          <span key={g.key as string} className={cn('rounded-full px-2 py-0.5 text-xs font-medium', g.color)}>{g.label}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.duesPaid
                        ? <CheckCircle className="h-5 w-5 text-green-500" />
                        : <XCircle className="h-5 w-5 text-red-400" />}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.pitZoneStatus || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Member Profile</h3>
              <div className="flex gap-2">
                <button onClick={() => setEditMode(e => !e)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700">
                  {getInitials(selected.name)}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selected.name}</p>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', ROLE_STYLES[selected.role])}>
                    {selected.role === 'parent' ? 'Guardian' : selected.role}
                  </span>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {(['firstName', 'lastName'] as const).map(key => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{key === 'firstName' ? 'First Name' : 'Last Name'}</label>
                        <input value={selected[key]} onChange={e => setSelected(s => s ? { ...s, [key]: e.target.value } : s)}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                      </div>
                    ))}
                  </div>
                  {([
                    { label: 'Email', key: 'email' as const },
                    { label: 'Phone', key: 'phone' as const },
                    { label: 'Grade', key: 'grade' as const },
                    { label: 'Pit Zone Status', key: 'pitZoneStatus' as const },
                    { label: 'Other Role', key: 'otherRole' as const },
                  ]).map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input value={(selected[key] as string) ?? ''} onChange={e => setSelected(s => s ? { ...s, [key]: e.target.value } : s)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Groups</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { key: 'isAdmin' as const, label: 'Full Admin' },
                        { key: 'isGuardian' as const, label: 'Guardian' },
                        { key: 'isRacer' as const, label: 'Racer' },
                        { key: 'isHSAthlete' as const, label: 'HS Athlete' },
                        { key: 'isDevAthlete' as const, label: 'Devo Athlete' },
                        { key: 'isGrit' as const, label: 'GRiT' },
                        { key: 'isTeamCaptain' as const, label: 'Team Captain' },
                        { key: 'isWindsorHS' as const, label: 'Windsor HS' },
                        { key: 'hasTrainingPeaks' as const, label: 'Training Peaks' },
                        { key: 'isChild' as const, label: 'Child' },
                      ]).map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input type="checkbox" checked={!!selected[key]}
                            onChange={e => setSelected(s => s ? { ...s, [key]: e.target.checked } : s)}
                            className="h-4 w-4 rounded border-gray-300 text-orange-500" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="duesPaid" checked={selected.duesPaid}
                      onChange={e => setSelected(s => s ? { ...s, duesPaid: e.target.checked } : s)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500" />
                    <label htmlFor="duesPaid" className="text-sm text-gray-700">Dues paid</label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                    <textarea value={selected.notes} onChange={e => setSelected(s => s ? { ...s, notes: e.target.value } : s)}
                      rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none resize-none" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleUpdateSelected} className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600">Save</button>
                    <button onClick={handleDeleteSelected} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">Remove</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    selected.email && { label: 'Email', value: selected.email },
                    selected.phone && { label: 'Phone', value: selected.phone },
                    selected.grade && { label: 'Grade', value: selected.grade },
                    { label: 'Dues Paid', value: selected.duesPaid ? '✓ Yes' : '✗ No' },
                    selected.pitZoneStatus && { label: 'Pit Zone', value: selected.pitZoneStatus },
                    selected.otherRole && { label: 'Other Role', value: selected.otherRole },
                    selected.notes && { label: 'Notes', value: selected.notes },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500 shrink-0">{(item as {label: string}).label}</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{(item as {value: string}).value}</span>
                    </div>
                  ))}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Groups</p>
                    <div className="flex flex-wrap gap-1.5">
                      {GROUP_LABELS.filter(g => selected[g.key] === true).map(g => (
                        <span key={g.key as string} className={cn('rounded-full px-2.5 py-1 text-xs font-medium', g.color)}>{g.label}</span>
                      ))}
                      {!GROUP_LABELS.some(g => selected[g.key] === true) && (
                        <span className="text-sm text-gray-400">No groups assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                </div>
              </div>
              {([
                { label: 'Email', key: 'email' as const, type: 'email' },
                { label: 'Phone', key: 'phone' as const, type: 'tel' },
                { label: 'Grade', key: 'grade' as const, type: 'text' },
                { label: 'Other Role/Title', key: 'otherRole' as const, type: 'text' },
              ]).map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} value={(form[key] as string) ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
                </div>
              ))}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Groups</p>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { key: 'isAdmin' as const, label: 'Full Admin' },
                    { key: 'isGuardian' as const, label: 'Guardian' },
                    { key: 'isRacer' as const, label: 'Racer' },
                    { key: 'isHSAthlete' as const, label: 'HS Athlete' },
                    { key: 'isDevAthlete' as const, label: 'Devo Athlete' },
                    { key: 'isGrit' as const, label: 'GRiT' },
                    { key: 'isTeamCaptain' as const, label: 'Team Captain' },
                    { key: 'isWindsorHS' as const, label: 'Windsor HS' },
                    { key: 'hasTrainingPeaks' as const, label: 'Training Peaks' },
                    { key: 'isChild' as const, label: 'Child' },
                  ]).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-orange-500" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="addDuesPaid" checked={form.duesPaid} onChange={e => setForm(f => ({ ...f, duesPaid: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500" />
                <label htmlFor="addDuesPaid" className="text-sm text-gray-700">Dues paid</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV import modal — 2-step wizard */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeImport}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Import CSV</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', importStep === 'upload' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500')}>1 Upload</span>
                  <ArrowRight className="h-3 w-3 text-gray-300" />
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', importStep === 'map' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500')}>2 Map columns</span>
                </div>
              </div>
              <button onClick={closeImport}><X className="h-5 w-5 text-gray-500" /></button>
            </div>

            {/* Step 1: Upload */}
            {importStep === 'upload' && (
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-4">
                  Upload any CSV file. You&apos;ll be able to map its columns to the correct fields in the next step.
                </p>
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-10 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors">
                  <Upload className="h-10 w-10" />
                  <span className="text-sm font-medium">Click to upload CSV file</span>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
              </div>
            )}

            {/* Step 2: Map columns */}
            {importStep === 'map' && (
              <>
                <div className="overflow-y-auto flex-1 p-6">
                  <p className="text-sm text-gray-500 mb-1">
                    <strong>{csvRows.length}</strong> rows detected. Map your CSV columns to the app fields below.
                    Auto-matched fields are pre-filled — only <strong>First Name</strong> is required.
                  </p>
                  <p className="text-xs text-gray-400 mb-5">Set a field to &quot;— skip —&quot; to ignore it.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {APP_FIELDS.map(field => (
                      <div key={field.key} className="flex flex-col gap-0.5">
                        <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          {field.label}
                          {field.required && <span className="text-orange-500">*</span>}
                          {field.boolean && <span className="text-gray-400 font-normal">(boolean)</span>}
                        </label>
                        <select
                          value={columnMap[field.key] ?? ''}
                          onChange={e => setColumnMap(m => ({ ...m, [field.key]: e.target.value }))}
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
                        >
                          <option value="">— skip —</option>
                          {csvHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Preview row */}
                  {csvRows[0] && (
                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Preview (first row)</p>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {APP_FIELDS.filter(f => columnMap[f.key]).map(f => (
                          <div key={f.key} className="flex gap-1 text-xs">
                            <dt className="text-gray-400 shrink-0">{f.label}:</dt>
                            <dd className="font-medium text-gray-700 truncate">{csvRows[0]![columnMap[f.key]!] ?? '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 border-t border-gray-200 px-6 py-4 shrink-0">
                  <button onClick={() => setImportStep('upload')} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Back
                  </button>
                  <button
                    onClick={applyImport}
                    disabled={!columnMap['firstName']}
                    className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Import {csvRows.length} row{csvRows.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
