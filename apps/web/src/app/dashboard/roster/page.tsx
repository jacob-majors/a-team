import { Search, CheckCircle, XCircle } from 'lucide-react'

const members = [
  { id: '1', name: 'Alex Chen', role: 'athlete', duesPaid: true, pitZoneStatus: 'Ready' },
  { id: '2', name: 'Jordan Smith', role: 'athlete', duesPaid: false, pitZoneStatus: 'Pending' },
  { id: '3', name: 'Coach Rivera', role: 'coach', duesPaid: true, pitZoneStatus: 'N/A' },
  { id: '4', name: 'Maya Johnson', role: 'athlete', duesPaid: true, pitZoneStatus: 'Ready' },
  { id: '5', name: 'Sam Williams', role: 'parent', duesPaid: true, pitZoneStatus: 'N/A' },
  { id: '6', name: 'Taylor Brown', role: 'athlete', duesPaid: false, pitZoneStatus: 'Pending' },
  { id: '7', name: 'Riley Davis', role: 'athlete', duesPaid: true, pitZoneStatus: 'Ready' },
  { id: '8', name: 'Coach Kim', role: 'coach', duesPaid: true, pitZoneStatus: 'N/A' },
]

const roleStyles: Record<string, string> = {
  athlete: 'bg-orange-100 text-orange-700',
  coach: 'bg-blue-100 text-blue-700',
  parent: 'bg-purple-100 text-purple-700',
  admin: 'bg-gray-100 text-gray-700',
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function RosterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Roster</h1>
          <p className="text-sm text-gray-500">{members.length} members</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>
        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-orange-400 focus:outline-none">
          <option value="">All roles</option>
          <option value="athlete">Athletes</option>
          <option value="coach">Coaches</option>
          <option value="parent">Parents</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Dues Paid</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Pit Zone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                        {getInitials(member.name)}
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyles[member.role]}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {member.duesPaid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{member.pitZoneStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
