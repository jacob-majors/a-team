'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays, Users, MessageSquare, FileText, HandHeart,
  Camera, Megaphone, LogOut, Database, Settings,
} from 'lucide-react'
import { cn } from '@a-team/utils'
import { createClient } from '@/lib/supabase/client'
import { useRole } from '@/components/layout/role-switcher'

const ALL_NAV = [
  { href: '/dashboard',               label: 'Calendar',      icon: CalendarDays,  exact: true, roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/roster',        label: 'Roster',        icon: Users,                      roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/chat',          label: 'Chat',          icon: MessageSquare,              roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone,                  roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/documents',     label: 'Documents',     icon: FileText,                   roles: ['admin','coach'] },
  { href: '/dashboard/volunteers',    label: 'Volunteers',    icon: HandHeart,                  roles: ['admin','coach','parent'] },
  { href: '/dashboard/photos',        label: 'Photos',        icon: Camera,                     roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/database',      label: 'Database',      icon: Database,                   roles: ['admin'] },
  { href: '/dashboard/settings',      label: 'Settings',      icon: Settings,                   roles: ['admin','coach','athlete','parent'] },
]

interface SidebarProps {
  userName: string
  userRole: string
  userAvatarUrl?: string
}

export function Sidebar({ userName, userRole, userAvatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { role } = useRole()

  const navItems = ALL_NAV.filter(item => item.roles.includes(role))

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 bg-brand-700 shrink-0">
      {/* Logo */}
      <div className="flex items-center justify-center px-5 py-5 border-b border-brand-600">
        <Image
          src="/logo.png"
          alt="A-Team Annadel Composite"
          width={160}
          height={54}
          className="object-contain h-14 w-auto brightness-0 invert"
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
                active ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-brand-200')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-brand-600 px-4 py-4">
        <div className="flex items-center gap-3">
          {userAvatarUrl ? (
            <Image src={userAvatarUrl} alt={userName} width={40} height={40}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-400" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 ring-2 ring-brand-400 text-sm font-bold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-xs text-brand-200 capitalize">{userRole}</p>
          </div>
          <button onClick={handleSignOut} className="rounded-md p-1.5 text-brand-200 hover:bg-white/10 hover:text-white transition-colors" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
