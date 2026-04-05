'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays, Users, MessageSquare, FileText, HandHeart,
  Camera, Megaphone, LogOut, Database, Settings, LayoutDashboard, Bike,
} from 'lucide-react'
import { cn } from '@a-team/utils'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/layout/role-switcher'

const ALL_NAV = [
  { href: '/dashboard/home', label: 'Dashboard', icon: LayoutDashboard, exact: true, roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard',      label: 'Calendar',  icon: CalendarDays,    exact: true, roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/roster',        label: 'Roster',        icon: Users,         roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/chat',          label: 'Chat',          icon: MessageSquare, roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone,     roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/documents',     label: 'Documents',     icon: FileText,      roles: ['admin','coach'] },
  { href: '/dashboard/volunteers',    label: 'Volunteers',    icon: HandHeart,     roles: ['admin','coach','parent'] },
  { href: '/dashboard/photos',        label: 'Photos',        icon: Camera,        roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/ride-groups',    label: 'Ride Groups',   icon: Bike,          roles: ['admin'] },
  { href: '/dashboard/database',      label: 'Database',      icon: Database,      roles: ['admin'] },
  { href: '/dashboard/settings',      label: 'Settings',      icon: Settings,      roles: ['admin','coach','athlete','parent'] },
]

interface SidebarProps {
  userName: string
  userRole: string
  userAvatarUrl?: string
}

export function Sidebar({ userName: initialUserName, userRole, userAvatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { role } = useRole()
  const [userName, setUserName] = useState(initialUserName)

  useEffect(() => {
    const devBypass = document.cookie.includes('dev_bypass=1')
    if (devBypass) {
      const stored = localStorage.getItem('dev_profile')
      if (stored) {
        const p = JSON.parse(stored)
        if (p.name) setUserName(p.name)
      }
    }
  }, [])

  const navItems = ALL_NAV.filter(item => item.roles.includes(role))

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const initials = userName.includes('@')
    ? userName.split('@')[0]!.slice(0, 2).toUpperCase()
    : userName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 shrink-0 relative">
      {/* Glass/blur background */}
      <div className="absolute inset-0 bg-brand-700/90 backdrop-blur-xl" />

      <div className="relative flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-white/15">
          <Image
            src="/logo.png"
            alt="A-Team Annadel Composite"
            width={200}
            height={68}
            className="object-contain h-16 w-auto brightness-0 invert"
            priority
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-white/50')} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/15 px-3 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/settings"
              className="flex flex-1 min-w-0 items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-white/10 transition-colors"
              title="Open settings"
            >
              {userAvatarUrl ? (
                <Image src={userAvatarUrl} alt={userName} width={36} height={36}
                  className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/30" />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 text-sm font-bold text-white">
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white leading-tight">{userName}</p>
                <p className="truncate text-xs text-white/60 capitalize">{roleLabel}</p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="shrink-0 rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
