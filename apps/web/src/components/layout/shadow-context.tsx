'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ShadowMember {
  memberId: string
  name: string
  role: string
}

interface ShadowCtx {
  shadow: ShadowMember | null
  setShadow: (m: ShadowMember | null) => void
}

const ShadowContext = createContext<ShadowCtx>({ shadow: null, setShadow: () => {} })

export function useShadow() { return useContext(ShadowContext) }

export function ShadowProvider({ children }: { children: ReactNode }) {
  const [shadow, setShadowState] = useState<ShadowMember | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('shadow_as')
    if (stored) { try { setShadowState(JSON.parse(stored)) } catch {} }
  }, [])

  function setShadow(m: ShadowMember | null) {
    setShadowState(m)
    if (m) localStorage.setItem('shadow_as', JSON.stringify(m))
    else localStorage.removeItem('shadow_as')
  }

  return <ShadowContext.Provider value={{ shadow, setShadow }}>{children}</ShadowContext.Provider>
}
