import { Camera, Plus, Image } from 'lucide-react'

const albums = [
  {
    id: '1',
    name: 'North Bay Regional 2025',
    date: 'Apr 5, 2025',
    count: 48,
    cover: null,
  },
  {
    id: '2',
    name: 'Spring Practice Sessions',
    date: 'Mar 2025',
    count: 32,
    cover: null,
  },
  {
    id: '3',
    name: 'Team Kickoff Day',
    date: 'Feb 1, 2025',
    count: 24,
    cover: null,
  },
  {
    id: '4',
    name: 'Season Opener Race',
    date: 'Mar 15, 2025',
    count: 61,
    cover: null,
  },
]

const albumColors = [
  'from-orange-400 to-orange-600',
  'from-blue-400 to-blue-600',
  'from-green-400 to-green-600',
  'from-purple-400 to-purple-600',
]

export default function PhotosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Albums</h1>
          <p className="text-sm text-gray-500">Team memories and race day photos</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600">
          <Plus className="h-4 w-4" /> New Album
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {albums.map((album, i) => (
          <div
            key={album.id}
            className="group cursor-pointer overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition hover:shadow-md"
          >
            <div className={`flex h-36 items-center justify-center bg-gradient-to-br ${albumColors[i % albumColors.length]}`}>
              <Camera className="h-10 w-10 text-white/60" />
            </div>
            <div className="p-3">
              <p className="font-medium text-gray-900 truncate text-sm">{album.name}</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <Image className="h-3 w-3" />
                {album.count} photos · {album.date}
              </div>
            </div>
          </div>
        ))}

        {/* Upload card */}
        <button className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-orange-400 hover:text-orange-400">
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Upload Photos</span>
        </button>
      </div>
    </div>
  )
}
