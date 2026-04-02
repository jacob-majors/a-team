import Link from 'next/link'
import { CalendarDays, Users, Megaphone, HandHeart } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome to A-Team — Annadel Composite MTB</p>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Roster', href: '/dashboard/roster', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Announcements', href: '/dashboard/announcements', icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Volunteers', href: '/dashboard/volunteers', icon: HandHeart, color: 'text-green-500', bg: 'bg-green-50' },
        ].map(({ label, href, icon: Icon, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm transition hover:border-orange-200 hover:shadow-md"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="font-semibold text-gray-900">{label}</p>
          </Link>
        ))}
      </div>

      {/* Upcoming events — will populate once calendar events are added */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <Link href="/dashboard/calendar" className="text-sm font-medium text-orange-500 hover:text-orange-600">
            View calendar →
          </Link>
        </div>
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-500">No upcoming events</p>
          <p className="text-sm text-gray-400">Add events in the Calendar to see them here</p>
          <Link
            href="/dashboard/calendar"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Go to Calendar
          </Link>
        </div>
      </div>
    </div>
  )
}
