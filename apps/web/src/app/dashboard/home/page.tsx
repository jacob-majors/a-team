'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Users, Megaphone, MessageSquare, ChevronRight, Heart, Newspaper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UpcomingEvent {
  id: string
  title: string
  type: string
  start_at: string
  location: string | null
}

interface RecentPost {
  id: string
  content: string
  image_url: string | null
  created_at: string
  author_name: string
  like_count: number
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = (h ?? 0) >= 12 ? 'PM' : 'AM'
  const hour = ((h ?? 0) % 12) || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

const TYPE_COLORS: Record<string, string> = {
  practice: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  race:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  meeting:  'bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-muted))]',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DashboardHomePage() {
  const supabase = createClient()
  const [firstName, setFirstName] = useState('')
  const [events, setEvents] = useState<UpcomingEvent[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])

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

    // Recent posts
    supabase.from('posts')
      .select('id, content, image_url, created_at, user_id, post_likes(id)')
      .eq('deleted', false)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(async ({ data: posts }) => {
        if (!posts?.length) return
        const userIds = [...new Set(posts.map(p => p.user_id))]
        const { data: profiles } = await supabase.from('users').select('id, name').in('id', userIds)
        const pm = Object.fromEntries((profiles ?? []).map(p => [p.id, p.name]))
        setRecentPosts(posts.map(p => ({
          id: p.id,
          content: p.content,
          image_url: p.image_url,
          created_at: p.created_at,
          author_name: pm[p.user_id] ?? 'Team Member',
          like_count: p.post_likes?.length ?? 0,
        })))
      })
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
                <Link key={ev.id} href={`/dashboard?date=${ev.start_at.slice(0, 10)}&eventId=${ev.id}`}
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

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[rgb(var(--text))]">Recent Posts</h2>
            <Link href="/dashboard/posts" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentPosts.map(post => (
              <Link key={post.id} href="/dashboard/posts"
                className="flex gap-3 items-start rounded-xl bg-[rgb(var(--surface))] border border-[rgb(var(--border))] p-3 hover:border-brand-300 transition">
                {post.image_url && (
                  <img src={post.image_url} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
                )}
                {!post.image_url && (
                  <div className="h-14 w-14 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                    <Newspaper className="h-6 w-6 text-brand-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-brand-600 dark:text-brand-400">{post.author_name}</p>
                  <p className="text-sm text-[rgb(var(--text))] line-clamp-2 mt-0.5">{post.content || 'Shared a photo'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[rgb(var(--text-muted))]">{timeAgo(post.created_at)}</span>
                    {post.like_count > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-[rgb(var(--text-muted))]">
                        <Heart className="h-3 w-3" /> {post.like_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
