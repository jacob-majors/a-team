import { CalendarDays, Users, Megaphone, HandHeart } from 'lucide-react'
import Link from 'next/link'

const upcomingEvents = [
  { id: '1', title: 'Thursday Practice', date: 'Thu, Apr 3', time: '4:00 PM', type: 'practice', location: 'Annadel State Park' },
  { id: '2', title: 'North Bay Regional Race', date: 'Sat, Apr 5', time: '8:00 AM', type: 'race', location: 'Stafford Lake' },
  { id: '3', title: 'Team Meeting', date: 'Mon, Apr 7', time: '6:30 PM', type: 'meeting', location: 'Online / Zoom' },
  { id: '4', title: 'Saturday Ride', date: 'Sat, Apr 12', time: '9:00 AM', type: 'practice', location: 'Annadel State Park' },
]

const eventTypeStyles: Record<string, string> = {
  practice: 'bg-blue-100 text-blue-700',
  race: 'bg-green-100 text-green-700',
  meeting: 'bg-gray-100 text-gray-700',
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back to A-Team</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Upcoming Events', value: '4', icon: CalendarDays, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Team Members', value: '28', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Announcements', value: '3', icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Open Volunteer Slots', value: '6', icon: HandHeart, color: 'text-green-500', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <Link href="/dashboard/calendar" className="text-sm font-medium text-orange-500 hover:text-orange-600">
            View calendar →
          </Link>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-orange-50 text-center">
                <span className="text-xs font-medium text-orange-600">{event.date.split(',')[0]}</span>
                <span className="text-lg font-bold text-orange-600 leading-tight">{event.date.split(' ')[2]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{event.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${eventTypeStyles[event.type]}`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{event.time} · {event.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
