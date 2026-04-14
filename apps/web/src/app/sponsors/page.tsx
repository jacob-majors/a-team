import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Heart } from 'lucide-react'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { sponsors } from './data'

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Annadel Composite" width={120} height={40} className="object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Home</Link>
          <Link href="/donate" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            <Heart className="h-4 w-4" /> Donate
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
            Team Portal <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand-900/60 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Our Sponsors
          </h1>
          <ScrollReveal direction="up">
            <p className="text-lg text-brand-100/80 max-w-xl mx-auto">
              {sponsors.length} incredible organizations make Annadel Composite possible.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Sponsor grid */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sponsors.map((sponsor, idx) => (
              <ScrollReveal key={sponsor.name} direction="up" delay={idx * 40}>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-200 text-center"
                >
                  <div
                    className="flex items-center justify-center h-16 w-16 rounded-2xl text-sm font-bold tracking-tight shadow-sm group-hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: sponsor.color, color: sponsor.textColor }}
                  >
                    {sponsor.initials}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-brand-600 transition-colors leading-tight">
                    {sponsor.name}
                  </span>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Become a sponsor CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-brand-50 to-brand-100 border-t border-brand-200">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Become a Sponsor</h2>
          <p className="text-gray-500 mb-8 text-lg">
            Join these amazing organizations in supporting 150+ student athletes.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Heart className="h-4 w-4" /> Donate Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <Image src="/logo.png" alt="Annadel Composite" width={100} height={34} className="object-contain opacity-60" />
          </Link>
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Annadel Composite Mountain Bike Team · NICA
          </p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Home</Link>
            <Link href="/donate" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Donate</Link>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
