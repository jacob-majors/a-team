'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Users, Megaphone, MessageSquare, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UpcomingEvent {
  id: string
  title: string
  type: string
  start_at: string
  location: string | null
}

const TYPE_COLORS: Record<string, string> = {
  practice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  race:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  meeting:  'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]',
}

export default function DashboardHomePage() {
  const supabase = createClient()
  const [firstName, setFirstName] = useState('')
  const [events, setEvents] = useState<UpcomingEvent[]>([])

  useEffect(() => {
    const devBypass = document.cookie.includes('dev_bypass=1')
    if (devBypass) {
      const stored = localStorage.getItem('dev_profile')
      const name = stored ? JSON.parse(stored).name : 'Jacob'
      setFirstName((name ?? 'Jacob').split(' ')[0])
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase.from('users').select('name').eq('id', data.user.id).single().then(({ data: u }) => {
            if (u?.name) setFirstName(u.name.split(' ')[0]!)
          })
        }
      })
    }

    supabase.from('events')
      .select('id, title, type, start_at, location')
      .gte('start_at', new Date().toISOString())
      .order('start_at')
      .limit(5)
      .then(({ data }) => { if (data) setEvents(data) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">
          {greeting}{firstName ? `, ${firstName}` : ''}! 👋
        </h1>
        <p className="text-sm text-[rgb(var(--text-muted))] mt-1">Welcome to A-Team — Annadel Composite MTB</p>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Calendar',      href: '/dashboard',               icon: CalendarDays,  color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-950/50' },
          { label: 'Roster',        href: '/dashboard/roster',        icon: Users,         color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Chat',          href: '/dashboard/chat',          icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Announcements', href: '/dashboard/announcements', icon: Megaphone,     color: 'text-purple-600',bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map(({ label, href, icon: Icon, color, bg }) => (
          <Link key={label} href={href}
            className="rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="font-semibold text-[rgb(var(--text))]">{label}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming events */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Upcoming Events</h2>
          <Link href="/dashboard" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View calendar <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-[rgb(var(--border))]" />
            <p className="mt-3 font-medium text-[rgb(var(--text-muted))]">No upcoming events</p>
            <p className="text-sm text-[rgb(var(--text-muted))] opacity-60 mt-1">Run the seed SQL or add events in the Calendar</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(ev => {
              const d = new Date(ev.start_at)
              return (
                <Link key={ev.id} href="/dashboard"
                  className="flex items-center gap-4 rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] px-4 py-3 hover:border-brand-300 transition">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/50">
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-300 uppercase">{d.toLocaleDateString('en', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-brand-700 dark:text-brand-200 leading-none">{d.getDate()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[rgb(var(--text))] truncate">{ev.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TYPE_COLORS[ev.type] ?? TYPE_COLORS.meeting}`}>{ev.type}</span>
                      {ev.location && <span className="text-xs text-[rgb(var(--text-muted))] truncate">{ev.location}</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[rgb(var(--text-muted))] shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
