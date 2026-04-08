import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, ExternalLink, Heart } from 'lucide-react'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { sponsors, sponsorCategories } from './data'

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
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
          <ScrollReveal direction="up" delay={0}>
            <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-200 bg-white/10 rounded-full uppercase tracking-wider mb-6 border border-white/20">
              Our Partners
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Our Sponsors
            </h1>
            <p className="text-lg text-brand-100/80 max-w-xl mx-auto">
              {sponsors.length} incredible organizations make Annadel Composite possible. We are deeply grateful for their support.
            </p>
          </ScrollReveal>

          {/* Count pills */}
          <ScrollReveal direction="up" delay={100}>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {sponsorCategories.map(cat => {
                const count = sponsors.filter(s => s.category === cat).length
                return (
                  <span key={cat} className="px-3 py-1.5 text-xs font-medium text-white/80 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                    {cat} ({count})
                  </span>
                )
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sponsors by category */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-6xl space-y-20">
          {sponsorCategories.map((category, catIdx) => {
            const catSponsors = sponsors.filter(s => s.category === category)
            if (catSponsors.length === 0) return null
            return (
              <div key={category}>
                <ScrollReveal direction="left" delay={0}>
                  <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 whitespace-nowrap">{category}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                    <span className="text-sm text-gray-400">{catSponsors.length} sponsor{catSponsors.length !== 1 ? 's' : ''}</span>
                  </div>
                </ScrollReveal>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catSponsors.map((sponsor, idx) => (
                    <ScrollReveal
                      key={sponsor.name}
                      direction="up"
                      delay={idx * 80}
                    >
                      <SponsorCard sponsor={sponsor} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Become a sponsor CTA */}
      <ScrollReveal direction="fade">
        <section className="py-20 px-6 bg-gradient-to-br from-brand-50 to-brand-100 border-t border-brand-200">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Become a Sponsor</h2>
            <p className="text-gray-500 mb-8 text-lg">
              Join these amazing organizations in supporting 150+ student athletes. Your logo, your legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
              >
                <Heart className="h-4 w-4" /> Donate Now
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-brand-700 border border-brand-300 rounded-xl hover:bg-brand-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

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

function SponsorCard({ sponsor }: { sponsor: import('./data').Sponsor }) {
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col h-full p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-300"
    >
      {/* Logo placeholder */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-2xl text-sm font-bold tracking-tight shadow-sm group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundColor: sponsor.color, color: sponsor.textColor }}
        >
          {sponsor.initials}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight group-hover:text-brand-700 transition-colors truncate">
            {sponsor.name}
          </h3>
          <span className="text-xs text-gray-400 mt-0.5 block">{sponsor.category}</span>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
        {sponsor.description}
      </p>

      {/* URL hint */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <span className="text-xs text-brand-500 group-hover:text-brand-600 transition-colors truncate block">
          {sponsor.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
        </span>
      </div>
    </a>
  )
}
