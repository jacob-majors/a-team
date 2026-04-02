import { MapPin, Clock, Users, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // TODO: fetch real event data via tRPC
  const event = {
    id: params.id,
    title: 'North Bay Regional Race',
    description:
      'Annual North Bay regional race at Stafford Lake. All riders must arrive by 7:30 AM for registration. Bring race license, helmet, and pads.',
    type: 'race' as const,
    date: 'Saturday, April 5, 2025',
    time: '8:00 AM – 4:00 PM',
    location: 'Stafford Lake Bike Park, Novato',
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" /> Back to calendar
      </Link>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-white">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {event.type}
          </span>
          <h1 className="mt-3 text-2xl font-bold">{event.title}</h1>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Clock className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-gray-900">{event.date}</p>
              <p className="text-sm">{event.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="h-5 w-5 text-gray-400" />
            <p>{event.location}</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>
        </div>
      </div>

      {/* RSVP */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Are you going?</h2>
        <div className="flex gap-3">
          {(['yes', 'maybe', 'no'] as const).map((status) => (
            <button
              key={status}
              className={`flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-colors capitalize
                ${status === 'yes' ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100' : ''}
                ${status === 'maybe' ? 'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : ''}
                ${status === 'no' ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100' : ''}
              `}
            >
              {status === 'yes' ? '✓ Going' : status === 'maybe' ? '? Maybe' : '✕ Can\'t Go'}
            </button>
          ))}
        </div>
      </div>

      {/* Ride Groups */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Ride Groups</h2>
          <button className="text-sm font-medium text-brand-500 hover:text-brand-600">+ Add Group</button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Varsity Boys', members: 6 },
            { name: 'Varsity Girls', members: 4 },
            { name: 'JV / Beginners', members: 8 },
          ].map((group) => (
            <div key={group.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
              <span className="font-medium text-gray-900">{group.name}</span>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Users className="h-4 w-4" />
                {group.members} riders
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
