'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  CalendarDays,
  Users,
  MessageSquare,
  FileText,
  HandHeart,
  Camera,
  Megaphone,
  LogOut,
  Database,
} from 'lucide-react'
import { cn } from '@a-team/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Calendar', icon: CalendarDays, exact: true },
  { href: '/dashboard/roster', label: 'Roster', icon: Users },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/volunteers', label: 'Volunteers', icon: HandHeart },
  { href: '/dashboard/photos', label: 'Photos', icon: Camera },
  { href: '/dashboard/database', label: 'Database', icon: Database },
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
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200">
        <Image src="/logo.png" alt="A-Team Annadel Composite" width={120} height={40} className="object-contain h-10 w-auto" />
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

      {/* User + Sign out */}
      <div className="border-t border-gray-200 px-4 py-4">
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
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{userName}</p>
            <p className="truncate text-xs text-gray-500">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
