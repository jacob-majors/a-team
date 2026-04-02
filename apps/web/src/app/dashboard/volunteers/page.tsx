import { HandHeart, Users, CheckCircle } from 'lucide-react'

const events = [
  {
    id: '1',
    name: 'North Bay Regional Race',
    date: 'Sat, Apr 5',
    slots: [
      { id: 's1', name: 'Pit Zone Marshal', capacity: 3, signups: 1 },
      { id: 's2', name: 'Course Sweep Rider', capacity: 2, signups: 2 },
      { id: 's3', name: 'Registration Desk', capacity: 2, signups: 0 },
      { id: 's4', name: 'Mechanic Support', capacity: 1, signups: 1 },
    ],
  },
  {
    id: '2',
    name: 'Saturday Practice',
    date: 'Sat, Apr 12',
    slots: [
      { id: 's5', name: 'Trailhead Carpool Driver', capacity: 4, signups: 2 },
      { id: 's6', name: 'First Aid Station', capacity: 1, signups: 0 },
    ],
  },
]

export default function VolunteersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteering</h1>
        <p className="text-sm text-gray-500">Sign up to help at upcoming events</p>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="font-semibold text-gray-900">{event.name}</h2>
              <p className="text-sm text-gray-500">{event.date}</p>
            </div>
            <div className="divide-y divide-gray-100">
              {event.slots.map((slot) => {
                const full = slot.signups >= slot.capacity
                const isSigned = false // TODO: check real signups

                return (
                  <div key={slot.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${full ? 'bg-green-50' : 'bg-orange-50'}`}>
                        <HandHeart className={`h-5 w-5 ${full ? 'text-green-500' : 'text-orange-500'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{slot.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="h-3 w-3" />
                          {slot.signups} / {slot.capacity} filled
                        </div>
                      </div>
                    </div>
                    {isSigned ? (
                      <div className="flex items-center gap-1.5 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" /> Signed up
                      </div>
                    ) : full ? (
                      <span className="text-sm text-gray-400">Full</span>
                    ) : (
                      <button className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600">
                        Sign Up
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
