'use client'

import { useState, useRef } from 'react'
import { Search, CheckCircle, XCircle, Upload, X, Plus, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'
import { cn } from '@a-team/utils'

type Role = 'athlete' | 'coach' | 'parent' | 'admin'

interface Member {
  id: string
  name: string
  email: string
  role: Role
  duesPaid: boolean
  duesAmount?: number
  pitZoneStatus?: string
  notes?: string
  phone?: string
  grade?: string
}

const ROLE_STYLES: Record<Role, string> = {
  athlete: 'bg-orange-100 text-orange-700',
  coach: 'bg-blue-100 text-blue-700',
  parent: 'bg-purple-100 text-purple-700',
  admin: 'bg-gray-100 text-gray-700',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const EMPTY_FORM: Omit<Member, 'id'> = {
  name: '', email: '', role: 'athlete', duesPaid: false, duesAmount: undefined, pitZoneStatus: '', notes: '', phone: '', grade: '',
}

export default function RosterPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [importResult, setImportResult] = useState<{ added: number; dupes: number; errors: string[] } | null>(null)
  const [editMode, setEditMode] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = !roleFilter || m.role === roleFilter
    return matchSearch && matchRole
  })

  function handleAddMember(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return
    const newMember: Member = { ...form, id: crypto.randomUUID() }
    setMembers(prev => [...prev, newMember])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const existingEmails = new Set(members.map(m => m.email.toLowerCase().trim()))
        const added: Member[] = []
        const dupes: string[] = []
        const errors: string[] = []

        results.data.forEach((row, i) => {
          const email = (row['email'] ?? row['Email'] ?? '').trim().toLowerCase()
          const name = (row['name'] ?? row['Name'] ?? row['full_name'] ?? row['Full Name'] ?? '').trim()

          if (!name) { errors.push(`Row ${i + 2}: missing name`); return }
          if (!email) { errors.push(`Row ${i + 2}: missing email`); return }

          if (existingEmails.has(email)) {
            dupes.push(email)
            return
          }

          existingEmails.add(email)
          added.push({
            id: crypto.randomUUID(),
            name,
            email,
            role: ((row['role'] ?? row['Role'] ?? '').toLowerCase() as Role) || 'athlete',
            duesPaid: ['true', 'yes', '1'].includes((row['dues_paid'] ?? row['Dues Paid'] ?? '').toLowerCase()),
            duesAmount: row['dues_amount'] ? Number(row['dues_amount']) : undefined,
            pitZoneStatus: row['pit_zone_status'] ?? row['Pit Zone'] ?? '',
            notes: row['notes'] ?? row['Notes'] ?? '',
            phone: row['phone'] ?? row['Phone'] ?? '',
            grade: row['grade'] ?? row['Grade'] ?? '',
          })
        })

        setMembers(prev => [...prev, ...added])
        setImportResult({ added: added.length, dupes: dupes.length, errors })
        if (fileRef.current) fileRef.current.value = ''
      },
      error: (err) => {
        setImportResult({ added: 0, dupes: 0, errors: [err.message] })
      }
    })
  }

  function handleUpdateSelected() {
    if (!selected) return
    setMembers(prev => prev.map(m => m.id === selected.id ? selected : m))
    setEditMode(false)
  }

  function handleDeleteSelected() {
    if (!selected) return
    setMembers(prev => prev.filter(m => m.id !== selected.id))
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Roster</h1>
          <p className="text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <button
            onClick={() => { setForm({ ...EMPTY_FORM }); setShowAdd(true) }}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Import result banner */}
      {importResult && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <AlertCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-medium text-green-800">
              Import complete — {importResult.added} added, {importResult.dupes} duplicate{importResult.dupes !== 1 ? 's' : ''} skipped
            </p>
            {importResult.errors.map((err, i) => (
              <p key={i} className="text-red-600 mt-1">{err}</p>
            ))}
          </div>
          <button onClick={() => setImportResult(null)} className="text-green-500 hover:text-green-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none"
        >
          <option value="">All roles</option>
          <option value="athlete">Athletes</option>
          <option value="coach">Coaches</option>
          <option value="parent">Parents</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-medium text-gray-500">No members yet</p>
          <p className="text-sm text-gray-400 mt-1">Add members manually or import a CSV file</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Dues Paid</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Pit Zone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(member => (
                  <tr
                    key={member.id}
                    onClick={() => { setSelected(member); setEditMode(false) }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', ROLE_STYLES[member.role])}>
                        {member.role}
                      </span>
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

      {/* Member detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Member Profile</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditMode(e => !e)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700">
                  {getInitials(selected.name)}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{selected.name}</p>
                  <p className="text-sm text-gray-500">{selected.email}</p>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  {[
                    { label: 'Name', key: 'name' as const, type: 'text' },
                    { label: 'Email', key: 'email' as const, type: 'email' },
                    { label: 'Phone', key: 'phone' as const, type: 'tel' },
                    { label: 'Grade', key: 'grade' as const, type: 'text' },
                    { label: 'Pit Zone Status', key: 'pitZoneStatus' as const, type: 'text' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        type={type}
                        value={(selected[key] as string) ?? ''}
                        onChange={e => setSelected(s => s ? { ...s, [key]: e.target.value } : s)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                    <select
                      value={selected.role}
                      onChange={e => setSelected(s => s ? { ...s, role: e.target.value as Role } : s)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                    >
                      {(['athlete', 'coach', 'parent', 'admin'] as Role[]).map(r => (
                        <option key={r} value={r} className="capitalize">{r}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="duesPaid"
                      checked={selected.duesPaid}
                      onChange={e => setSelected(s => s ? { ...s, duesPaid: e.target.checked } : s)}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500"
                    />
                    <label htmlFor="duesPaid" className="text-sm text-gray-700">Dues paid</label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                    <textarea
                      value={selected.notes ?? ''}
                      onChange={e => setSelected(s => s ? { ...s, notes: e.target.value } : s)}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateSelected}
                      className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Role', value: <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', ROLE_STYLES[selected.role])}>{selected.role}</span> },
                    { label: 'Email', value: selected.email },
                    selected.phone && { label: 'Phone', value: selected.phone },
                    selected.grade && { label: 'Grade', value: selected.grade },
                    { label: 'Dues Paid', value: selected.duesPaid ? '✓ Yes' : '✗ No' },
                    selected.pitZoneStatus && { label: 'Pit Zone', value: selected.pitZoneStatus },
                    selected.notes && { label: 'Notes', value: selected.notes },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
                      <span className="text-sm text-gray-500 shrink-0">{(item as {label: string}).label}</span>
                      <span className="text-sm font-medium text-gray-900 text-right">{(item as {value: React.ReactNode}).value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add member modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Member</h3>
              <button onClick={() => setShowAdd(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              {[
                { label: 'Full Name *', key: 'name' as const, type: 'text', placeholder: 'Alex Johnson' },
                { label: 'Email *', key: 'email' as const, type: 'email', placeholder: 'alex@email.com' },
                { label: 'Phone', key: 'phone' as const, type: 'tel', placeholder: '(555) 000-0000' },
                { label: 'Grade', key: 'grade' as const, type: 'text', placeholder: '9th' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form[key] as string) ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                >
                  {(['athlete', 'coach', 'parent', 'admin'] as Role[]).map(r => (
                    <option key={r} value={r} className="capitalize">{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="newDuesPaid"
                  checked={form.duesPaid}
                  onChange={e => setForm(f => ({ ...f, duesPaid: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-orange-500"
                />
                <label htmlFor="newDuesPaid" className="text-sm text-gray-700">Dues paid</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV import modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowImport(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Import CSV</h3>
              <button onClick={() => setShowImport(false)}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-4 text-sm text-orange-800">
                <p className="font-medium mb-2">Expected CSV columns:</p>
                <code className="text-xs bg-white rounded px-2 py-1 border border-orange-200 block">
                  name, email, role, phone, grade, dues_paid, pit_zone_status, notes
                </code>
                <p className="mt-2 text-xs text-orange-600">
                  Only <strong>name</strong> and <strong>email</strong> are required. Duplicates (matched by email) are automatically skipped.
                </p>
              </div>

              <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors">
                <Upload className="h-10 w-10" />
                <span className="text-sm font-medium">Click to upload CSV file</span>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { handleCSV(e); setShowImport(false) }} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
