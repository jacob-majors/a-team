'use client'

import { createContext, useContext, useState } from 'react'

type Role = 'admin' | 'coach' | 'athlete' | 'parent'

interface RoleCtx {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleCtx>({ role: 'coach', setRole: () => {} })

export function useRole() {
  return useContext(RoleContext)
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('coach')
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

const ROLES: { value: Role; label: string; color: string; active: string }[] = [
  { value: 'admin', label: 'Admin', color: 'text-gray-600', active: 'bg-gray-900 text-white' },
  { value: 'coach', label: 'Coach', color: 'text-blue-600', active: 'bg-blue-600 text-white' },
  { value: 'athlete', label: 'Athlete', color: 'text-brand-600', active: 'bg-brand-500 text-white' },
  { value: 'parent', label: 'Parent', color: 'text-purple-600', active: 'bg-purple-600 text-white' },
]

export function RoleSwitcher() {
  const { role, setRole } = useRole()

  return (
    <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
      {ROLES.map(r => (
        <button
          key={r.value}
          onClick={() => setRole(r.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            role === r.value ? r.active : `${r.color} hover:bg-gray-200`
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
