import Image from 'next/image'
import Link from 'next/link'
import { Users, Award, MapPin, Mountain, Heart, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SponsorsMarquee } from '@/components/landing/sponsors-marquee'
import { LandingNav } from '@/components/landing/nav'
import { CoachesSection } from '@/components/landing/coaches'
import { sponsors } from './sponsors/data'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="relative h-screen flex flex-col justify-between overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Annadel Composite riders on trail"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950/60 via-brand-900/50 to-brand-950/75" />

        {/* Main text — pushed toward top-center */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pt-20 pb-32">
          <div className="text-center max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-300 mb-4">
              Sonoma County · NICA Mountain Biking
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight drop-shadow-md">
              Annadel
              <span className="block text-brand-300">Composite</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              150+ riders, 80+ coaches, one community — building strong bodies, minds, and a lifelong love of mountain biking.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/donate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-500 transition-colors shadow-lg"
              >
                <Heart className="h-4 w-4" />
                Support the Team
              </Link>
              <Link
                href="/sign-in"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Team Portal Login
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar pinned to bottom */}
        <div className="relative z-10 grid grid-cols-4 divide-x divide-white/10 border-t border-white/10 bg-black/30 backdrop-blur-sm">
          {[
            { value: '150+', label: 'Student Athletes' },
            { value: '80+',  label: 'Volunteer Coaches' },
            { value: 'NICA', label: 'Sanctioned League' },
            { value: 'K–12', label: 'All Grades Welcome' },
          ].map(({ value, label }) => (
            <div key={label} className="py-4 px-3 text-center">
              <div className="text-xl sm:text-2xl font-extrabold text-white">{value}</div>
              <div className="text-xs text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full uppercase tracking-wider mb-4">
                About Us
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">More Than a Bike Team</h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                NICA teams develop the whole athlete — not just fitness, but resilience, teamwork, and lifelong love of the outdoors.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              { icon: <Mountain className="h-6 w-6" />, title: 'Trail-Ready Athletes', body: 'Our riders train on real trails, building technical skills, strength, and confidence that carry into every aspect of their lives.', delay: 0 },
              { icon: <Users className="h-6 w-6" />, title: '80+ Dedicated Coaches', body: 'Our volunteer coaching staff is one of the largest in NICA. Every rider gets personal attention, mentorship, and a safe environment to grow.', delay: 80 },
              { icon: <Award className="h-6 w-6" />, title: 'NICA Sanctioned', body: 'We compete in the official NICA league, following guidelines that prioritize safety, inclusivity, and fun.', delay: 160 },
              { icon: <MapPin className="h-6 w-6" />, title: 'Sonoma County Roots', body: "Based in Sonoma County, we ride the trails and represent the community we love — from Annadel State Park and beyond.", delay: 240 },
            ].map(({ icon, title, body, delay }) => (
              <ScrollReveal key={title} direction="up" delay={delay}>
                <div className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-brand-100 hover:bg-brand-50/30 transition-colors group h-full">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-brand-600 text-white group-hover:bg-brand-700 transition-colors">
                    {icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal direction="up">
            <div className="text-center mb-14">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full uppercase tracking-wider mb-4">
                Meet the Team
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Coaches</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                80+ dedicated volunteers who show up every week to build strong riders, strong minds, and a lifelong love of the outdoors.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={80}>
            <CoachesSection />
          </ScrollReveal>
        </div>
      </section>

      {/* NICA + NorCal */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-5xl space-y-16">

          {/* NICA */}
          <ScrollReveal direction="up">
            <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-brand-600 to-brand-800 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-brand-200 uppercase tracking-wider mb-1">Founded 2009</p>
                  <h2 className="text-2xl font-extrabold text-white">What is NICA?</h2>
                  <p className="text-brand-200 text-sm mt-1">National Interscholastic Cycling Association</p>
                </div>
                <a href="https://www.nationalmtb.org" target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                  nationalmtb.org →
                </a>
              </div>
              <div className="p-8">
                <p className="text-gray-500 leading-relaxed mb-8 max-w-2xl">
                  NICA is a nonprofit that builds strong minds, bodies, and character in students grades 6–12 through the sport of mountain biking. Teams compete across sanctioned leagues in 30 states, guided by coaches who volunteer their time to grow the next generation of riders.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { num: '24,500+', label: 'Student Athletes', desc: 'Across all 32 NICA leagues nationwide' },
                    { num: '14,500+', label: 'Volunteer Coaches', desc: 'Trained, certified, and passionate about youth cycling' },
                    { num: '32',      label: 'Leagues',           desc: 'Spanning 30 states across the U.S.' },
                    { num: '2009',    label: 'Founded',           desc: 'Over 15 years developing youth mountain biking' },
                  ].map(({ num, label, desc }) => (
                    <div key={label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-2xl sm:text-3xl font-extrabold text-brand-600 mb-1">{num}</div>
                      <div className="text-sm font-semibold text-gray-800 mb-1">{label}</div>
                      <div className="text-xs text-gray-400 leading-snug">{desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['6th–12th Grade', 'All Skill Levels', 'Co-ed Teams', 'Season Racing', 'Nonprofit', 'Character Development'].map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* NorCal */}
          <ScrollReveal direction="up" delay={100}>
            <div className="rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://norcal.nationalmtb.org/hubfs/Brand-Assets/NICA-Leagues/NorCal/NORCAL-2025-lockup.png"
                    alt="NorCal NICA League"
                    className="h-12 object-contain"
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Our Home League</p>
                    <h2 className="text-2xl font-extrabold text-white">NorCal League</h2>
                    <p className="text-gray-400 text-sm mt-1">Northern California Interscholastic Cycling League</p>
                  </div>
                </div>
                <a href="https://norcal.nationalmtb.org" target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                  norcalmtb.org →
                </a>
              </div>
              <div className="p-8">
                <p className="text-gray-500 leading-relaxed mb-8 max-w-2xl">
                  The NorCal League is one of the largest and most competitive NICA leagues in the country. Annadel Composite races as part of NorCal, competing against teams from across Northern California in a full season of trail events and races.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { num: '50+',  label: 'Teams',          desc: 'Competing across Northern California' },
                    { num: '4–5',  label: 'Races / Season', desc: 'Full-day events at premier trail venues' },
                    { num: '#1',   label: 'Largest League', desc: 'One of the biggest NICA leagues in the nation' },
                    { num: 'Fall', label: 'Race Season',    desc: 'September through November each year' },
                  ].map(({ num, label, desc }) => (
                    <div key={label} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                      <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-1">{num}</div>
                      <div className="text-sm font-semibold text-gray-800 mb-1">{label}</div>
                      <div className="text-xs text-gray-400 leading-snug">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Schools */}
      <section className="py-20 px-6 bg-white overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full uppercase tracking-wider mb-4">
                Our Community
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Schools We Serve</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                We draw riders from 40+ schools across the greater Santa Rosa area — all welcome, all skill levels.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={80}>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
              {[
                { v: '40+',  l: 'Schools' },
                { v: '18',   l: 'Middle Schools' },
                { v: '22+',  l: 'High Schools' },
                { v: '5',    l: 'Cities' },
                { v: 'K–12', l: 'All Grades' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center p-4 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="text-2xl font-extrabold text-brand-600">{v}</div>
                  <div className="text-xs text-gray-500 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={120}>
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {['Santa Rosa', 'Windsor', 'Rohnert Park', 'Cotati', 'Healdsburg'].map(city => (
                <span key={city} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  {city}
                </span>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="scale" delay={160}>
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ height: '400px' }}>
              <iframe
                src="https://www.google.com/maps/d/embed?mid=1z8R_W2Rp4NTJVkIIr7u9aHcQiq2czhNB&ehbc=2E312F&ll=38.473,-122.762&z=11"
                title="Schools Map Preview"
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: 'none' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href="/schools"
                className="absolute inset-0 flex items-end justify-center pb-6 bg-gradient-to-t from-black/30 to-transparent group"
              >
                <span className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand-600/90 backdrop-blur-sm rounded-xl shadow group-hover:bg-brand-600 transition-colors">
                  View Interactive Map <ChevronRight className="h-4 w-4" />
                </span>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-24 px-6 bg-gray-50 overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full uppercase tracking-wider mb-4">
                Thank You
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Our Sponsors</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                {sponsors.length} amazing organizations support our riders. Hover to pause — click to learn more.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="fade" delay={150}>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
              <SponsorsMarquee />
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={200}>
            <div className="mt-10 text-center">
              <Link
                href="/sponsors"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-brand-600 border border-brand-300 rounded-xl hover:bg-brand-50 transition-colors"
              >
                View All {sponsors.length} Sponsors <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Portal CTA */}
      <ScrollReveal direction="scale">
        <section className="py-24 px-6 bg-gradient-to-br from-brand-600 to-brand-900">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Already on the team?</h2>
            <p className="text-brand-200 text-lg mb-8">
              Access schedules, event RSVPs, team announcements, the roster, and more in the team portal.
            </p>
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-brand-700 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
            >
              Sign in to the Portal <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* Donate CTA */}
      <ScrollReveal direction="up">
        <section className="py-16 px-6 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-2xl text-center">
            <Heart className="h-10 w-10 text-brand-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Support Our Riders</h2>
            <p className="text-gray-500 mb-6">
              Donations help fund trail days, race fees, equipment, and team events for 150+ student athletes.
            </p>
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Heart className="h-4 w-4" /> Donate to the Team
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo.png" alt="Annadel Composite" width={100} height={34} className="object-contain opacity-60" />
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Annadel Composite Mountain Bike Team · NICA
          </p>
          <div className="flex items-center gap-4">
            <Link href="/schools" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Schools</Link>
            <Link href="/sponsors" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Sponsors</Link>
            <Link href="/donate" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Donate</Link>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Team Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
