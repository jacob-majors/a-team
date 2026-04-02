import { X, Megaphone, Plus } from 'lucide-react'

const announcements = [
  {
    id: '1',
    title: 'Race Season Kickoff — Important Info',
    body: 'The 2025 race season is officially starting! All athletes must have an updated NorCal league registration and medical waiver on file before attending any races. Please check the Documents section and submit by April 1st.',
    author: 'Coach Rivera',
    date: 'Mar 28, 2025',
  },
  {
    id: '2',
    title: 'Helmet & Pads Policy Update',
    body: 'Effective immediately, all riders must wear a full-face helmet AND knee/shin pads for all downhill segments during practice. MIPS-rated trail helmets are acceptable for XC rides only.',
    author: 'Admin',
    date: 'Mar 22, 2025',
  },
  {
    id: '3',
    title: 'Spring Fundraiser — Jersey Orders Open',
    body: 'Jersey and kit orders for the 2025 season are now open! Order deadline is April 10th. Use the link in the Documents section to fill out your sizing form. No late orders will be accepted.',
    author: 'Admin',
    date: 'Mar 15, 2025',
  },
]

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">Team-wide broadcasts from coaches and admins</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div key={item.id} className="relative rounded-xl bg-white border border-gray-200 shadow-sm p-6">
            <button className="absolute right-4 top-4 rounded-md p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500">
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-start gap-4 pr-8">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                <Megaphone className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.body}</p>
                <p className="mt-3 text-xs text-gray-400">
                  {item.author} · {item.date}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
