'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  CalendarDays,
  Users,
  MessageSquare,
  FileText,
  HandHeart,
  Camera,
  Megaphone,
  Bike,
} from 'lucide-react'
import { cn } from '@a-team/utils'

const navItems = [
  { href: '/dashboard', label: 'Calendar', icon: CalendarDays, exact: true },
  { href: '/dashboard/roster', label: 'Roster', icon: Users },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/volunteers', label: 'Volunteers', icon: HandHeart },
  { href: '/dashboard/photos', label: 'Photos', icon: Camera },
]

interface SidebarProps {
  userName: string
  userAvatar?: string
  userEmail: string
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white">
          <Bike className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-tight">A-Team</p>
          <p className="text-xs text-gray-500 leading-tight">Annadel Composite</p>
        </div>
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
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-5 w-5', active ? 'text-orange-500' : 'text-gray-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{userName}</p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
