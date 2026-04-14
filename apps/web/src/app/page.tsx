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
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Annadel Composite riders on trail"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,30,42,0.5)_0%,rgba(2,30,42,0.62)_24%,rgba(2,30,42,0.78)_56%,rgba(2,30,42,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_34%,rgba(15,184,227,0.18),transparent_34%)]" />

        <div className="relative z-10 flex flex-1 items-end px-5 pb-8 pt-28 sm:px-8 sm:pb-10 sm:pt-32 lg:px-16 lg:pb-12 lg:pt-36">
          <div className="max-w-3xl rounded-[2rem] border border-white/15 bg-black/45 px-5 py-6 backdrop-blur-sm sm:px-7 sm:py-8 lg:px-10 lg:py-10">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.28em] text-brand-200 sm:text-xs">
              Sonoma County · NICA Mountain Biking
            </p>
            <h1 className="text-[clamp(3.35rem,10vw,7.6rem)] font-black leading-[0.94] tracking-tight text-white [text-wrap:balance]">
              Annadel
              <br />
              <span className="text-brand-300">Composite</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/88 sm:text-lg sm:leading-8">
              150+ riders. 80+ volunteer coaches. One team focused on strong bodies, strong minds, and a lifelong love of mountain biking.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/68 sm:text-base">
              Join a Sonoma County program where students in grades 6-12 build skills, confidence, and community on the trail.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-brand-500"
              >
                <Heart className="h-4 w-4" />
                Support the Team
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/6 px-6 py-3 text-sm font-semibold text-white/82 transition-colors hover:bg-white/12 hover:text-white"
              >
                Team Portal
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar — pinned to bottom */}
        <div className="relative z-10 grid grid-cols-2 border-t border-white/10 bg-black/45 backdrop-blur-sm sm:grid-cols-4 sm:divide-x sm:divide-white/10">
          {[
            { v: '150+', l: 'Student Athletes' },
            { v: '80+',  l: 'Volunteer Coaches' },
            { v: 'NICA', l: 'Sanctioned' },
            { v: '6–12', l: 'All Grades' },
          ].map(({ v, l }) => (
            <div key={l} className="border-b border-white/10 px-4 py-4 text-center last:border-b-0 sm:border-b-0 sm:px-2">
              <div className="text-lg font-extrabold text-white sm:text-2xl">{v}</div>
              <div className="mt-1 text-[10px] text-white/60 sm:text-xs">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <ScrollReveal direction="left">
            <h2 className="text-4xl font-black leading-[0.95] text-gray-900 sm:text-6xl lg:text-7xl">
              More<br />than a<br />
              <span className="text-brand-600">bike team.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="right" delay={100}>
            <p className="mb-5 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              Annadel Composite is a NICA-sanctioned mountain bike team for students grades 6–12 across Sonoma County. We're one of the largest composite teams in NorCal — 150+ riders drawn from 40+ schools in Santa Rosa, Windsor, Rohnert Park, Cotati, and Healdsburg.
            </p>
            <p className="mb-8 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
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
      <section className="bg-gray-50 px-5 py-20 sm:px-8 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal direction="up">
            <h2 className="mb-10 text-3xl font-black text-gray-900 sm:text-4xl">Our League</h2>
          </ScrollReveal>
          <div className="grid gap-5 md:grid-cols-2">

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
      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <ScrollReveal direction="left">
              <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">40+ Schools</h2>
              <p className="mt-2 max-w-md text-gray-500">
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
      <section className="overflow-hidden bg-gray-50 py-20">
        <div className="mx-auto mb-10 max-w-6xl px-5 sm:px-8 lg:px-16">
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
        <div className="mx-auto grid max-w-6xl gap-0 divide-y divide-white/10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 md:divide-x md:divide-y-0 lg:px-16">
          <ScrollReveal direction="left">
            <div className="pb-14 md:pr-16 md:pb-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-300">Already a member?</p>
              <h2 className="mb-4 text-4xl font-black leading-none text-white sm:text-5xl">
                Team<br />Portal
              </h2>
              <p className="mb-8 max-w-md leading-7 text-white/62">
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
            <div className="pt-14 md:pl-16 md:pt-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-brand-300">Want to help?</p>
              <h2 className="mb-4 text-4xl font-black leading-none text-white sm:text-5xl">
                Support<br />the Team
              </h2>
              <p className="mb-8 max-w-md leading-7 text-white/62">
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
      <footer className="border-t border-white/5 bg-brand-950 px-5 py-8 sm:px-8 lg:px-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
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
