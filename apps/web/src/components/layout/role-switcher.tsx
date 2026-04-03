'use client'

import { createContext, useContext, useState } from 'react'

type Role = 'admin' | 'coach' | 'athlete' | 'parent'

interface RoleCtx {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleCtx>({ role: 'admin', setRole: () => {} })

export function useRole() {
  return useContext(RoleContext)
}

export function RoleProvider({ children, defaultRole = 'admin' }: { children: React.ReactNode; defaultRole?: Role }) {
  const [role, setRole] = useState<Role>(defaultRole)
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

const ROLES: { value: Role; label: string; active: string; inactive: string }[] = [
  { value: 'admin',   label: 'Admin',   active: 'bg-brand-600 text-white',   inactive: 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]' },
  { value: 'coach',   label: 'Coach',   active: 'bg-blue-600 text-white',    inactive: 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]' },
  { value: 'athlete', label: 'Athlete', active: 'bg-green-600 text-white',   inactive: 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]' },
  { value: 'parent',  label: 'Parent',  active: 'bg-purple-600 text-white',  inactive: 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]' },
]

export function RoleSwitcher() {
  const { role, setRole } = useRole()

  return (
    <div className="flex items-center gap-0.5 rounded-xl bg-[rgb(var(--bg-secondary))] p-1 border border-[rgb(var(--border))]">
      {ROLES.map(r => (
        <button
          key={r.value}
          onClick={() => setRole(r.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${role === r.value ? r.active : r.inactive}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
