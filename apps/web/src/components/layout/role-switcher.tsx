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

const ROLE_COLORS: Record<Role, string> = {
  admin:   'text-brand-600 dark:text-brand-400',
  coach:   'text-blue-600 dark:text-blue-400',
  athlete: 'text-green-600 dark:text-green-400',
  parent:  'text-purple-600 dark:text-purple-400',
}

export function RoleSwitcher() {
  const { role, setRole } = useRole()

  return (
    <div className="relative flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] px-2.5 py-1.5">
      <span className="text-xs text-[rgb(var(--text-muted))]">View as:</span>
      <select
        value={role}
        onChange={e => setRole(e.target.value as Role)}
        className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1 ${ROLE_COLORS[role]}`}
      >
        {ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>
    </div>
  )
}
