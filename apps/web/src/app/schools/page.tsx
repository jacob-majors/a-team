import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Heart } from 'lucide-react'
import { SchoolList } from '@/components/schools/school-list'

const MAP_EMBED = 'https://www.google.com/maps/d/embed?mid=1z8R_W2Rp4NTJVkIIr7u9aHcQiq2czhNB&ehbc=2E312F&ll=38.473010782268915,-122.76263195&z=11'

const stats = [
  { value: '40+',   label: 'Partner Schools' },
  { value: '18',    label: 'Middle Schools' },
  { value: '22+',   label: 'High Schools' },
  { value: '5',     label: 'Cities Served' },
]

const cities = ['Santa Rosa', 'Windsor', 'Rohnert Park', 'Cotati', 'Healdsburg']

export default function SchoolsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 bg-white/92 backdrop-blur-md border-b border-gray-100">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Annadel Composite" width={90} height={30} className="object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Home</Link>
          <Link href="/sponsors" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Sponsors</Link>
          <Link href="/donate" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            <Heart className="h-4 w-4" /> Donate
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
            Team Portal <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-14 px-6 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-brand-900/60 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Schools We Serve
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mb-8">
            Annadel Composite draws riders from 40+ schools across the greater Santa Rosa area — middle school and high school students united by two wheels and one community.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4 text-center">
                <div className="text-2xl font-extrabold text-white">{value}</div>
                <div className="text-xs text-white/70 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Cities */}
          <div className="mt-5 flex flex-wrap gap-2">
            {cities.map(c => (
              <span key={c} className="px-3 py-1 text-xs font-medium text-white/90 bg-white/10 border border-white/20 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Map + List */}
      <section className="px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6" style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}>

            {/* Map */}
            <div className="flex-1 lg:flex-[2] rounded-2xl overflow-hidden border border-gray-200 shadow-lg min-h-[400px] lg:min-h-0">
              <iframe
                src={MAP_EMBED}
                title="Annadel Composite Schools Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* School list */}
            <div className="lg:flex-[1] flex flex-col rounded-2xl border border-gray-200 shadow-sm bg-white p-4 overflow-hidden" style={{ maxHeight: '80vh' }}>
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h2 className="text-base font-bold text-gray-900">Browse Schools</h2>
                <span className="text-xs text-gray-400">Click to open in Maps</span>
              </div>
              <SchoolList />
            </div>

          </div>

          <p className="mt-4 text-xs text-gray-400 text-center">
            Map data sourced from Annadel Composite. Click any pin or school name to view in Google Maps.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-100 mt-8">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="Annadel Composite" width={100} height={34} className="object-contain opacity-60" />
          </Link>
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Annadel Composite Mountain Bike Team · NICA
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Home</Link>
            <Link href="/sponsors" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Sponsors</Link>
            <Link href="/donate" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Donate</Link>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
