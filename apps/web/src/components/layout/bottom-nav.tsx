'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Users, MessageSquare, Megaphone, MoreHorizontal } from 'lucide-react'
import { cn } from '@a-team/utils'

const navItems = [
  { href: '/dashboard',               label: 'Dashboard', icon: CalendarDays, exact: true },
  { href: '/dashboard/roster',        label: 'Roster',   icon: Users },
  { href: '/dashboard/chat',          label: 'Chat',     icon: MessageSquare },
  { href: '/dashboard/announcements', label: 'News',     icon: Megaphone },
  { href: '/dashboard/more',          label: 'More',     icon: MoreHorizontal },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface))] md:hidden">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                active ? 'text-brand-500' : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
