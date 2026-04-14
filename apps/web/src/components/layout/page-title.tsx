'use client'

import { usePathname } from 'next/navigation'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard/home':          'Home',
  '/dashboard':               'Calendar',
  '/dashboard/roster':        'Roster',
  '/dashboard/chat':          'Chat',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/documents':     'Documents',
  '/dashboard/volunteers':    'Volunteers',
  '/dashboard/posts':         'Team Feed',
  '/dashboard/ride-groups':   'Ride Groups',
  '/dashboard/database':      'Database',
  '/dashboard/settings':      'Settings',
  '/dashboard/photos':        'Photos',
  '/dashboard/more':          'More',
}

export function PageTitle() {
  const pathname = usePathname()

  // Match longest prefix first
  const title = Object.entries(ROUTE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([route]) => pathname === route || pathname.startsWith(route + '/'))?.[1]
    ?? 'Dashboard'

  return (
    <span className="text-sm font-semibold text-[rgb(var(--text))]">{title}</span>
  )
}
