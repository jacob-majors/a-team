import Image from 'next/image'
import Link from 'next/link'
import { Heart, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SponsorsMarquee } from '@/components/landing/sponsors-marquee'
import { LandingNav } from '@/components/landing/nav'
import { sponsors } from './sponsors/data'

export default function LandingPage() {
  return (
    <div className="bg-white">
      <LandingNav />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative h-screen flex flex-col overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Annadel Composite riders on trail"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        {/* Heavy at bottom so text pops, light at top so photo shows */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/92 via-brand-950/45 to-brand-950/15" />

        {/* Text — bottom-left, clear of nav and stats bar */}
        <div className="relative z-10 flex-1 flex items-end px-6 sm:px-10 lg:px-16 pb-6">
          <div className="max-w-2xl">
            <p className="text-brand-300 text-xs font-bold tracking-[0.25em] uppercase mb-4">
              Sonoma County · NICA Mountain Biking
            </p>
            <h1 className="font-black text-white leading-[0.92] tracking-tight text-[clamp(4rem,11vw,8.5rem)]">
              Annadel
              <br />
              <span className="text-brand-300">Composite</span>
            </h1>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-md leading-relaxed">
              150+ riders. 80+ coaches. One community — building strong bodies, minds, and a lifelong love of mountain biking.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-500 transition-colors shadow-lg"
              >
                <Heart className="h-4 w-4" />
                Support the Team
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white/70 border border-white/20 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
              >
                Team Portal
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar — pinned to bottom */}
        <div className="relative z-10 grid grid-cols-4 divide-x divide-white/10 border-t border-white/10 bg-black/40 backdrop-blur-sm">
          {[
            { v: '150+', l: 'Student Athletes' },
            { v: '80+',  l: 'Volunteer Coaches' },
            { v: 'NICA', l: 'Sanctioned' },
            { v: '6–12', l: 'All Grades' },
          ].map(({ v, l }) => (
            <div key={l} className="py-4 text-center">
              <div className="text-lg sm:text-2xl font-extrabold text-white">{v}</div>
              <div className="text-[10px] sm:text-xs text-white/45 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-16 items-center">
          <ScrollReveal direction="left">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[0.95]">
              More<br />than a<br />
              <span className="text-brand-600">bike team.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={100}>
            <p className="text-gray-500 leading-relaxed text-lg mb-5">
              Annadel Composite is a NICA-sanctioned mountain bike team for students grades 6–12 across Sonoma County. We're one of the largest composite teams in NorCal — 150+ riders drawn from 40+ schools in Santa Rosa, Windsor, Rohnert Park, Cotati, and Healdsburg.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Our 80+ volunteer coaches — all NICA-certified — show up every week to build not just strong riders, but confident, resilient young people who love the outdoors and look out for each other.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Grades 6–12', 'All Skill Levels', 'Co-ed', 'Season Racing', 'NICA Certified Coaches', 'Sonoma County'].map(tag => (
                <span key={tag} className="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── NICA + NORCAL ───────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-10">Our League</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-5">

            {/* NICA */}
            <ScrollReveal direction="left">
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm h-full flex flex-col">
                <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-7 py-6">
                  <p className="text-xs font-bold text-brand-200 uppercase tracking-widest mb-2">Founded 2009</p>
                  <h3 className="text-2xl font-extrabold text-white">NICA</h3>
                  <p className="text-brand-200/70 text-sm mt-1">National Interscholastic Cycling Association</p>
                </div>
                <div className="p-7 bg-white flex-1 flex flex-col">
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    NICA builds strong minds, bodies, and character in students grades 6–12 through the sport of mountain biking — with sanctioned leagues in 30 states.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { n: '24,500+', l: 'Student Athletes' },
                      { n: '14,500+', l: 'Volunteer Coaches' },
                      { n: '32',      l: 'Leagues' },
                      { n: '30',      l: 'States' },
                    ].map(({ n, l }) => (
                      <div key={l} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="text-xl font-extrabold text-brand-600">{n}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                  <a
                    href="https://www.nationalmtb.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    nationalmtb.org <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* NorCal */}
            <ScrollReveal direction="right" delay={80}>
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm h-full flex flex-col">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-7 py-6 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://norcal.nationalmtb.org/hubfs/Brand-Assets/NICA-Leagues/NorCal/NORCAL-2025-lockup.png"
                    alt="NorCal NICA League"
                    className="h-10 w-auto object-contain flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Our Home League</p>
                    <h3 className="text-2xl font-extrabold text-white">NorCal</h3>
                    <p className="text-gray-400/70 text-sm mt-0.5">Northern California</p>
                  </div>
                </div>
                <div className="p-7 bg-white flex-1 flex flex-col">
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    NorCal is one of the largest, most competitive NICA leagues in the nation. Annadel Composite races against teams across Northern California in a full season of trail events.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { n: '50+',  l: 'Teams' },
                      { n: '4–5',  l: 'Races / Season' },
                      { n: '#1',   l: 'Largest League' },
                      { n: 'Fall', l: 'Race Season' },
                    ].map(({ n, l }) => (
                      <div key={l} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="text-xl font-extrabold text-gray-800">{n}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                  <a
                    href="https://norcal.nationalmtb.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    norcalmtb.org <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── SCHOOLS ─────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-10 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <ScrollReveal direction="left">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">40+ Schools</h2>
              <p className="mt-2 text-gray-500 max-w-md">
                From Santa Rosa to Healdsburg — all students welcome, all skill levels.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="flex flex-wrap gap-2">
                {['Santa Rosa', 'Windsor', 'Rohnert Park', 'Cotati', 'Healdsburg'].map(city => (
                  <span key={city} className="px-3 py-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">
                    {city}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal direction="up" delay={80}>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ height: '420px' }}>
              <iframe
                src="https://www.google.com/maps/d/embed?mid=1z8R_W2Rp4NTJVkIIr7u9aHcQiq2czhNB&ehbc=2E312F&ll=38.473,-122.762&z=11"
                title="Schools Map"
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: 'none' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="/schools"
                className="absolute bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-600/90 backdrop-blur-sm rounded-xl shadow hover:bg-brand-600 transition-colors"
              >
                Open Interactive Map <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── SPONSORS ────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 mb-10">
          <div className="flex items-end justify-between gap-4">
            <ScrollReveal direction="left">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Our Sponsors</h2>
              <p className="mt-1 text-gray-500 text-sm">
                {sponsors.length} organizations making this team possible.
              </p>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <Link
                href="/sponsors"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
        <ScrollReveal direction="fade">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
            <SponsorsMarquee />
          </div>
        </ScrollReveal>
      </section>

      {/* ── DUAL CTA ─────────────────────────────────────────── */}
      <section className="bg-brand-950">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-20 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 gap-0">
          <ScrollReveal direction="left">
            <div className="md:pr-16 pb-14 md:pb-0">
              <p className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-3">Already a member?</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-none">
                Team<br />Portal
              </h2>
              <p className="text-white/45 mb-8 leading-relaxed">
                Schedules, RSVPs, announcements, roster, chat — everything in one place.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-brand-950 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
              >
                Sign in <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={80}>
            <div className="pt-14 md:pt-0 md:pl-16">
              <p className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-3">Want to help?</p>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-none">
                Support<br />the Team
              </h2>
              <p className="text-white/45 mb-8 leading-relaxed">
                Donations fund trail days, race fees, gear, and coaching for 150+ student athletes.
              </p>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-500 transition-colors shadow-lg"
              >
                <Heart className="h-4 w-4" /> Donate
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="bg-brand-950 border-t border-white/5 px-6 sm:px-10 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/logo.png"
            alt="Annadel Composite"
            width={88}
            height={30}
            className="object-contain brightness-0 invert opacity-40"
          />
          <p className="text-xs text-white/25 text-center">
            © {new Date().getFullYear()} Annadel Composite Mountain Bike Team · NICA · Windsor, CA
          </p>
          <div className="flex items-center gap-5">
            {[['Schools', '/schools'], ['Sponsors', '/sponsors'], ['Donate', '/donate'], ['Portal', '/sign-in']].map(([label, href]) => (
              <Link key={label} href={href as string} className="text-xs text-white/35 hover:text-white/70 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
