'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText, HandHeart, Camera, Megaphone,
  Settings, Bike, Database, ChevronRight,
} from 'lucide-react'
import { useRole } from '@/components/layout/role-switcher'

const MORE_ITEMS = [
  { href: '/dashboard/announcements', label: 'Announcements', description: 'Team-wide broadcasts',             icon: Megaphone, color: 'bg-orange-50 text-orange-500 dark:bg-orange-950/30',  roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/documents',     label: 'Documents',     description: 'Files, waivers, and resources',   icon: FileText,  color: 'bg-blue-50 text-blue-500 dark:bg-blue-950/30',     roles: ['admin','coach'] },
  { href: '/dashboard/volunteers',    label: 'Volunteering',  description: 'Sign up for event volunteer slots',icon: HandHeart, color: 'bg-green-50 text-green-500 dark:bg-green-950/30',  roles: ['admin','coach','parent'] },
  { href: '/dashboard/photos',        label: 'Photos',        description: 'Race day photos and memories',    icon: Camera,    color: 'bg-purple-50 text-purple-500 dark:bg-purple-950/30', roles: ['admin','coach','athlete','parent'] },
  { href: '/dashboard/ride-groups',   label: 'Ride Groups',   description: 'Manage time-trial ride groups',   icon: Bike,      color: 'bg-teal-50 text-teal-500 dark:bg-teal-950/30',     roles: ['admin'] },
  { href: '/dashboard/database',      label: 'Database',      description: 'Member records and exports',      icon: Database,  color: 'bg-gray-100 text-gray-500 dark:bg-gray-800',        roles: ['admin','coach'] },
  { href: '/dashboard/settings',      label: 'Settings',      description: 'Profile, theme, and preferences', icon: Settings,  color: 'bg-brand-50 text-brand-500 dark:bg-brand-950/30',   roles: ['admin','coach','athlete','parent'] },
]

export default function MorePage() {
  const { role } = useRole()
  const visible = MORE_ITEMS.filter(i => i.roles.includes(role))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[rgb(var(--text))]">More</h1>
      <div className="rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] shadow-sm overflow-hidden divide-y divide-[rgb(var(--border))]">
        {visible.map(({ href, label, description, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="flex items-center gap-4 px-4 py-3.5 hover:bg-[rgb(var(--bg-secondary))] transition-colors active:bg-[rgb(var(--bg-secondary))]">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[rgb(var(--text))]">{label}</p>
              <p className="text-xs text-[rgb(var(--text-muted))] truncate">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[rgb(var(--text-muted))] shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
