'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Users, GraduationCap, UserCheck, Download, Search, Plus, X,
  ChevronDown, CheckCircle, XCircle, Mail, Phone, Edit2, Save,
} from 'lucide-react'
import { cn } from '@a-team/utils'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberRole = 'athlete' | 'coach' | 'parent' | 'admin'
type Section = 'riders' | 'coaches' | 'alumni'

interface Member {
  id: string
  name: string
  email: string
  phone: string | null
  role: MemberRole
  emailOptIn: boolean
  isAlumni: boolean
  alumniSince: string | null
  notes: string | null
  createdAt: string
  // roster profile
  grade: string | null
  school: string | null
  jerseyNumber: string | null
  bikeType: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  duesPaid: boolean
  pitZoneStatus: string | null
  leagueRegistered: boolean
  // alumni profile
  graduationYear: number | null
  yearsActive: string | null
  achievements: string | null
  currentStatus: string | null
  wantsContact: boolean
}

// ─── Export modal ────────────────────────────────────────────────────────────

function ExportModal({ onClose, members }: { onClose: () => void; members: Member[] }) {
  const [selected, setSelected] = useState({
    athletes: true,
    coaches: true,
    parents: true,
    admins: false,
    alumni: true,
    optInOnly: true,
  })

  function toggle(key: keyof typeof selected) {
    setSelected(s => ({ ...s, [key]: !s[key] }))
  }

  function doExport() {
    let filtered = members
    const roles: MemberRole[] = []
    if (selected.athletes) roles.push('athlete')
    if (selected.coaches)  roles.push('coach')
    if (selected.parents)  roles.push('parent')
    if (selected.admins)   roles.push('admin')

    filtered = filtered.filter(m => {
      const matchRole = roles.includes(m.role) || (selected.alumni && m.isAlumni)
      const matchOpt  = !selected.optInOnly || m.emailOptIn
      return matchRole && matchOpt
    })

    const rows = filtered.map(m => ({
      Name: m.name,
      Email: m.email,
      Phone: m.phone ?? '',
      Role: m.isAlumni ? `Alumni (${m.role})` : m.role,
      'Email Opt-In': m.emailOptIn ? 'Yes' : 'No',
    }))

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `a-team-emails-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  const count = members.filter(m => {
    const roles: MemberRole[] = []
    if (selected.athletes) roles.push('athlete')
    if (selected.coaches)  roles.push('coach')
    if (selected.parents)  roles.push('parent')
    if (selected.admins)   roles.push('admin')
    return (roles.includes(m.role) || (selected.alumni && m.isAlumni)) && (!selected.optInOnly || m.emailOptIn)
  }).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 className="font-semibold text-gray-900">Export Email List</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-500" /></button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-gray-500 mb-4">Choose who to include in the export.</p>

          {[
            { key: 'athletes' as const, label: 'Athletes (current)' },
            { key: 'coaches'  as const, label: 'Coaches (current)' },
            { key: 'parents'  as const, label: 'Parents / Guardians' },
            { key: 'admins'   as const, label: 'Admins' },
            { key: 'alumni'   as const, label: 'Alumni' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selected[key]} onChange={() => toggle(key)}
                className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}

          <div className="border-t border-gray-100 pt-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={selected.optInOnly} onChange={() => toggle('optInOnly')}
                className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              <span className="text-sm font-medium text-gray-700">Email opt-in only</span>
            </label>
          </div>

          <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-2 text-sm text-brand-700 font-medium">
            {count} email{count !== 1 ? 's' : ''} will be exported
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700">Cancel</button>
            <button onClick={doExport} disabled={count === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-500 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Member detail slide-over ─────────────────────────────────────────────

function MemberDetail({ member, onClose, onSave, section }: {
  member: Member
  onClose: () => void
  onSave: (updated: Partial<Member>) => Promise<void>
  section: Section
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Member>>({})

  function startEdit() { setForm({ ...member }); setEditing(true) }
  function cancelEdit() { setEditing(false); setForm({}) }
  async function saveEdit() { await onSave(form); setEditing(false) }
  function set(key: keyof Member, val: unknown) { setForm(f => ({ ...f, [key]: val })) }
  const f = editing ? { ...member, ...form } : member

  const rosterFields = [
    { label: 'Grade', key: 'grade' as const, type: 'text' },
    { label: 'School', key: 'school' as const, type: 'text' },
    { label: 'Jersey #', key: 'jerseyNumber' as const, type: 'text' },
    { label: 'Bike Type', key: 'bikeType' as const, type: 'text' },
    { label: 'Emergency Contact', key: 'emergencyContactName' as const, type: 'text' },
    { label: 'Emergency Phone', key: 'emergencyContactPhone' as const, type: 'tel' },
    { label: 'Pit Zone', key: 'pitZoneStatus' as const, type: 'text' },
  ]

  const alumniFields = [
    { label: 'Graduation Year', key: 'graduationYear' as const, type: 'number' },
    { label: 'Years Active', key: 'yearsActive' as const, type: 'text' },
    { label: 'Current Status', key: 'currentStatus' as const, type: 'text' },
    { label: 'Achievements', key: 'achievements' as const, type: 'text' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-900">Member Details</h3>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={saveEdit} className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-sm text-white">
                  <Save className="h-3.5 w-3.5" /> Save
                </button>
                <button onClick={cancelEdit} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">Cancel</button>
              </>
            ) : (
              <button onClick={startEdit} className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              {editing ? (
                <input value={f.name ?? ''} onChange={e => set('name', e.target.value)}
                  className="text-lg font-bold text-gray-900 border-b border-brand-400 outline-none bg-transparent" />
              ) : (
                <p className="text-lg font-bold text-gray-900">{member.name}</p>
              )}
              <span className={cn('text-xs font-medium rounded-full px-2 py-0.5 capitalize',
                member.isAlumni ? 'bg-purple-100 text-purple-700' :
                member.role === 'athlete' ? 'bg-brand-100 text-brand-700' :
                member.role === 'coach' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              )}>
                {member.isAlumni ? 'Alumni' : member.role}
              </span>
            </div>
          </div>

          {/* Core fields */}
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</h4>
            {[
              { label: 'Email', key: 'email' as const, type: 'email', icon: <Mail className="h-4 w-4 text-gray-400" /> },
              { label: 'Phone', key: 'phone' as const, type: 'tel', icon: <Phone className="h-4 w-4 text-gray-400" /> },
            ].map(({ label, key, type, icon }) => (
              <div key={key} className="flex items-center gap-3">
                {icon}
                {editing ? (
                  <input type={type} value={(f[key] as string) ?? ''} onChange={e => set(key, e.target.value)}
                    placeholder={label}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none" />
                ) : (
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-gray-800">{(member[key] as string) || '—'}</p>
                  </div>
                )}
              </div>
            ))}

            {/* Email opt-in */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email opt-in</span>
              {editing ? (
                <input type="checkbox" checked={f.emailOptIn ?? false} onChange={e => set('emailOptIn', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-500" />
              ) : (
                member.emailOptIn
                  ? <CheckCircle className="h-5 w-5 text-green-500" />
                  : <XCircle className="h-5 w-5 text-red-400" />
              )}
            </div>
          </section>

          {/* Roster profile fields (riders/coaches) */}
          {section !== 'alumni' && (
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Roster Details</h4>
              {rosterFields.map(({ label, key, type }) => (
                <div key={key} className="flex justify-between items-center gap-4">
                  <span className="text-sm text-gray-500 shrink-0 w-36">{label}</span>
                  {editing ? (
                    <input type={type} value={(f[key] as string) ?? ''} onChange={e => set(key, e.target.value)}
                      placeholder="—"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none text-right" />
                  ) : (
                    <span className="text-sm font-medium text-gray-800 text-right">{(member[key] as string) || '—'}</span>
                  )}
                </div>
              ))}
              {/* Boolean roster fields */}
              {[
                { label: 'Dues Paid', key: 'duesPaid' as const },
                { label: 'League Registered', key: 'leagueRegistered' as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  {editing ? (
                    <input type="checkbox" checked={(f[key] as boolean) ?? false} onChange={e => set(key, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                  ) : (
                    (member[key] as boolean)
                      ? <CheckCircle className="h-5 w-5 text-green-500" />
                      : <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Alumni profile fields */}
          {section === 'alumni' && (
            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Alumni Details</h4>
              {alumniFields.map(({ label, key, type }) => (
                <div key={key} className="flex justify-between items-center gap-4">
                  <span className="text-sm text-gray-500 shrink-0 w-36">{label}</span>
                  {editing ? (
                    <input type={type} value={(f[key] as string) ?? ''} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                      placeholder="—"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-400 focus:outline-none text-right" />
                  ) : (
                    <span className="text-sm font-medium text-gray-800 text-right">{(member[key] as string | number | null) ?? '—'}</span>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Wants Contact</span>
                {editing ? (
                  <input type="checkbox" checked={f.wantsContact ?? false} onChange={e => set('wantsContact', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500" />
                ) : (
                  member.wantsContact ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Notes</h4>
            {editing ? (
              <textarea value={f.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none resize-none" />
            ) : (
              <p className="text-sm text-gray-700">{member.notes || '—'}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DatabasePage() {
  const supabase = createClient()
  const [section, setSection] = useState<Section>('riders')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Member | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [myRole, setMyRole] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: u } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      setMyRole(u?.role ?? null)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadMembers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  async function loadMembers() {
    setLoading(true)
    setSelected(null)

    let query = supabase
      .from('users')
      .select(`
        id, name, email, phone, role, email_opt_in, is_alumni, alumni_since, notes, created_at,
        roster_profiles (
          grade, school, jersey_number, bike_type,
          emergency_contact_name, emergency_contact_phone,
          dues_paid, pit_zone_status, league_registered
        ),
        alumni_profiles (
          graduation_year, years_active, achievements, current_status, wants_contact
        )
      `)

    if (section === 'riders')  query = query.eq('role', 'athlete').eq('is_alumni', false)
    if (section === 'coaches') query = query.in('role', ['coach', 'admin']).eq('is_alumni', false)
    if (section === 'alumni')  query = query.eq('is_alumni', true)

    const { data } = await query.order('name')
    setLoading(false)
    if (!data) return

    setMembers(data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      emailOptIn: row.email_opt_in,
      isAlumni: row.is_alumni,
      alumniSince: row.alumni_since,
      notes: row.notes,
      createdAt: row.created_at,
      grade: row.roster_profiles?.grade ?? null,
      school: row.roster_profiles?.school ?? null,
      jerseyNumber: row.roster_profiles?.jersey_number ?? null,
      bikeType: row.roster_profiles?.bike_type ?? null,
      emergencyContactName: row.roster_profiles?.emergency_contact_name ?? null,
      emergencyContactPhone: row.roster_profiles?.emergency_contact_phone ?? null,
      duesPaid: row.roster_profiles?.dues_paid ?? false,
      pitZoneStatus: row.roster_profiles?.pit_zone_status ?? null,
      leagueRegistered: row.roster_profiles?.league_registered ?? false,
      graduationYear: row.alumni_profiles?.graduation_year ?? null,
      yearsActive: row.alumni_profiles?.years_active ?? null,
      achievements: row.alumni_profiles?.achievements ?? null,
      currentStatus: row.alumni_profiles?.current_status ?? null,
      wantsContact: row.alumni_profiles?.wants_contact ?? false,
    })))
  }

  async function handleSave(updated: Partial<Member>) {
    if (!selected) return
    // Update core user fields
    await supabase.from('users').update({
      name: updated.name ?? selected.name,
      email: updated.email ?? selected.email,
      phone: updated.phone ?? selected.phone,
      email_opt_in: updated.emailOptIn ?? selected.emailOptIn,
      notes: updated.notes ?? selected.notes,
    }).eq('id', selected.id)

    if (section !== 'alumni') {
      const rosterData = {
        grade: updated.grade ?? selected.grade,
        school: updated.school ?? selected.school,
        jersey_number: updated.jerseyNumber ?? selected.jerseyNumber,
        bike_type: updated.bikeType ?? selected.bikeType,
        emergency_contact_name: updated.emergencyContactName ?? selected.emergencyContactName,
        emergency_contact_phone: updated.emergencyContactPhone ?? selected.emergencyContactPhone,
        dues_paid: updated.duesPaid ?? selected.duesPaid,
        pit_zone_status: updated.pitZoneStatus ?? selected.pitZoneStatus,
        league_registered: updated.leagueRegistered ?? selected.leagueRegistered,
      }
      const { data: existing } = await supabase.from('roster_profiles').select('id').eq('user_id', selected.id).single()
      if (existing) {
        await supabase.from('roster_profiles').update(rosterData).eq('user_id', selected.id)
      } else {
        await supabase.from('roster_profiles').insert({ ...rosterData, user_id: selected.id, id: crypto.randomUUID() })
      }
    } else {
      const alumniData = {
        graduation_year: updated.graduationYear ?? selected.graduationYear,
        years_active: updated.yearsActive ?? selected.yearsActive,
        achievements: updated.achievements ?? selected.achievements,
        current_status: updated.currentStatus ?? selected.currentStatus,
        wants_contact: updated.wantsContact ?? selected.wantsContact,
      }
      const { data: existing } = await supabase.from('alumni_profiles').select('id').eq('user_id', selected.id).single()
      if (existing) {
        await supabase.from('alumni_profiles').update(alumniData).eq('user_id', selected.id)
      } else {
        await supabase.from('alumni_profiles').insert({ ...alumniData, user_id: selected.id, id: crypto.randomUUID() })
      }
    }
    await loadMembers()
    setSelected(prev => prev ? { ...prev, ...updated } : null)
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    (m.phone ?? '').includes(search)
  )

  if (myRole !== 'admin' && myRole !== 'coach') {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        <p>This section is for coaches and admins only.</p>
      </div>
    )
  }

  const sectionConfig = {
    riders: { label: 'Riders', icon: Users, color: 'orange' },
    coaches: { label: 'Coaches & Staff', icon: UserCheck, color: 'blue' },
    alumni: { label: 'Alumni', icon: GraduationCap, color: 'purple' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Database</h1>
          <p className="text-sm text-gray-500">{filtered.length} member{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          <Download className="h-4 w-4" /> Export Emails
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {(Object.keys(sectionConfig) as Section[]).map(key => {
          const { label, icon: Icon } = sectionConfig[key]
          return (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                section === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, phone…"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-brand-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="font-medium text-gray-500">No records found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Phone</th>
                  {section === 'riders'  && <th className="px-6 py-3 text-left font-medium text-gray-500">Grade</th>}
                  {section === 'coaches' && <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>}
                  {section === 'alumni'  && <th className="px-6 py-3 text-left font-medium text-gray-500">Class of</th>}
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Opt-in</th>
                  {section === 'riders' && <th className="px-6 py-3 text-left font-medium text-gray-500">Dues</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(m => (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="font-medium text-gray-900">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{m.email}</td>
                    <td className="px-6 py-4 text-gray-600">{m.phone || '—'}</td>
                    {section === 'riders'  && <td className="px-6 py-4 text-gray-600">{m.grade || '—'}</td>}
                    {section === 'coaches' && <td className="px-6 py-4 capitalize text-gray-600">{m.role}</td>}
                    {section === 'alumni'  && <td className="px-6 py-4 text-gray-600">{m.graduationYear || '—'}</td>}
                    <td className="px-6 py-4">
                      {m.emailOptIn
                        ? <CheckCircle className="h-5 w-5 text-green-500" />
                        : <XCircle className="h-5 w-5 text-gray-300" />}
                    </td>
                    {section === 'riders' && (
                      <td className="px-6 py-4">
                        {m.duesPaid
                          ? <CheckCircle className="h-5 w-5 text-green-500" />
                          : <XCircle className="h-5 w-5 text-red-400" />}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail slide-over */}
      {selected && (
        <MemberDetail
          member={selected}
          section={section}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      )}

      {/* Export modal */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} members={members} />}
    </div>
  )
}
