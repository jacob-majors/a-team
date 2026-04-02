import Link from 'next/link'
import { FileText, HandHeart, Camera } from 'lucide-react'

const moreItems = [
  { href: '/dashboard/documents', label: 'Documents & Forms', description: 'Team files, waivers, and resources', icon: FileText, color: 'bg-blue-50 text-blue-500' },
  { href: '/dashboard/volunteers', label: 'Volunteering', description: 'Sign up for event volunteer slots', icon: HandHeart, color: 'bg-green-50 text-green-500' },
  { href: '/dashboard/photos', label: 'Photo Albums', description: 'Race day photos and team memories', icon: Camera, color: 'bg-purple-50 text-purple-500' },
]

export default function MorePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">More</h1>
      <div className="space-y-3">
        {moreItems.map(({ href, label, description, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4 shadow-sm transition hover:border-brand-200"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
