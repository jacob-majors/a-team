import { FileText, Download, ExternalLink, Plus } from 'lucide-react'

const categories = ['All', 'Waivers & Forms', 'Race Info', 'Team Policies', 'Resources']

const documents = [
  { id: '1', name: '2025 Medical Waiver', category: 'Waivers & Forms', type: 'PDF', size: '124 KB', date: 'Mar 1, 2025' },
  { id: '2', name: 'NorCal League Registration Guide', category: 'Race Info', type: 'PDF', size: '2.1 MB', date: 'Feb 15, 2025' },
  { id: '3', name: 'Helmet & Safety Policy', category: 'Team Policies', type: 'PDF', size: '89 KB', date: 'Mar 22, 2025' },
  { id: '4', name: 'Season Race Schedule', category: 'Race Info', type: 'PDF', size: '340 KB', date: 'Jan 10, 2025' },
  { id: '5', name: 'Jersey Order Form', category: 'Waivers & Forms', type: 'Link', size: '—', date: 'Mar 15, 2025' },
  { id: '6', name: 'Annadel Trail Map', category: 'Resources', type: 'PDF', size: '5.3 MB', date: 'Jan 5, 2025' },
  { id: '7', name: 'Code of Conduct', category: 'Team Policies', type: 'PDF', size: '78 KB', date: 'Jan 1, 2025' },
]

const categoryColors: Record<string, string> = {
  'Waivers & Forms': 'bg-blue-100 text-blue-700',
  'Race Info': 'bg-green-100 text-green-700',
  'Team Policies': 'bg-purple-100 text-purple-700',
  'Resources': 'bg-gray-100 text-gray-700',
}

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents & Forms</h1>
          <p className="text-sm text-gray-500">Team files, waivers, and resources</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600">
          <Plus className="h-4 w-4" /> Upload
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              cat === 'All'
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Doc list */}
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[doc.category] ?? 'bg-gray-100 text-gray-700'}`}>
                    {doc.category}
                  </span>
                  <span className="text-xs text-gray-400">{doc.size} · {doc.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.type === 'Link' ? (
                  <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                ) : (
                  <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
