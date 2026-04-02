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
import { ThemeToggle } from '@/components/theme/toggle'

const navItems = [
  { href: '/dashboard',              label: 'Calendar',      icon: CalendarDays,  exact: true },
  { href: '/dashboard/roster',       label: 'Roster',        icon: Users },
  { href: '/dashboard/chat',         label: 'Chat',          icon: MessageSquare },
  { href: '/dashboard/announcements',label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/documents',    label: 'Documents',     icon: FileText },
  { href: '/dashboard/volunteers',   label: 'Volunteers',    icon: HandHeart },
  { href: '/dashboard/photos',       label: 'Photos',        icon: Camera },
  { href: '/dashboard/database',     label: 'Database',      icon: Database },
  { href: '/dashboard/settings',     label: 'Settings',      icon: Settings },
]

interface SidebarProps {
  userName: string
  userEmail: string
  userAvatarUrl?: string
}

export function Sidebar({ userName, userEmail, userAvatarUrl }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-[rgb(var(--surface))] border-r border-[rgb(var(--border))] shrink-0">
      {/* Logo */}
      <div className="flex items-center px-5 py-4 border-b border-[rgb(var(--border))]">
        <Image
          src="/logo.png"
          alt="A-Team Annadel Composite"
          width={120}
          height={40}
          className="object-contain h-10 w-auto dark:brightness-110"
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
                active
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))] hover:text-[rgb(var(--text))]'
              )}
            >
              <Icon className={cn('h-5 w-5', active ? 'text-brand-500 dark:text-brand-400' : 'text-[rgb(var(--text-muted))]')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle + user */}
      <div className="border-t border-[rgb(var(--border))] px-4 py-3 space-y-3">
        <ThemeToggle />
        <div className="flex items-center gap-3">
          {userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt={userName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-xs font-bold text-brand-700 dark:text-brand-400">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[rgb(var(--text))]">{userName}</p>
            <p className="truncate text-xs text-[rgb(var(--text-muted))]">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))] hover:text-[rgb(var(--text))]"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
