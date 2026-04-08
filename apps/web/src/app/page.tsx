import Image from 'next/image'
import Link from 'next/link'
import { Users, Award, MapPin, Mountain, Heart, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Annadel Composite" width={120} height={40} className="object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/donate"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 border border-brand-600 rounded-lg hover:bg-brand-50 transition-colors"
          >
            <Heart className="h-4 w-4" />
            Donate
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            Team Portal
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-brand-300/30 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-brand-800/40 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Annadel Composite"
              width={200}
              height={68}
              className="object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
            Annadel Composite
            <span className="block text-brand-200 text-3xl sm:text-4xl md:text-5xl mt-2">
              Mountain Bike Team
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            A National Interscholastic Cycling Association (NICA) team from Sonoma County — building strong bodies, minds, and character through the sport of mountain biking.
          </p>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { value: '150+', label: 'Student Athletes' },
              { value: '80+',  label: 'Coaches' },
              { value: 'NICA', label: 'Sanctioned' },
              { value: 'K–12', label: 'Grades' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{value}</div>
                <div className="text-xs sm:text-sm text-white/70 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-brand-700 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
            >
              <Heart className="h-5 w-5" />
              Support the Team
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/40 rounded-xl hover:bg-white/10 transition-colors"
            >
              Team Portal Login
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs">Learn more</span>
          <div className="h-6 w-px bg-white/30 animate-bounce" />
        </div>
      </section>

      {/* About NICA section */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full uppercase tracking-wider mb-4">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              More Than a Bike Team
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              NICA teams develop the whole athlete through mountain biking — not just fitness, but resilience, teamwork, and lifelong love of the outdoors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                icon: <Mountain className="h-6 w-6" />,
                title: 'Trail-Ready Athletes',
                body: 'Our riders train on real trails, building technical skills, strength, and confidence that carry into every aspect of their lives.',
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: '80+ Dedicated Coaches',
                body: 'Our volunteer coaching staff is one of the largest in NICA. Every rider gets personal attention, mentorship, and a safe environment to grow.',
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: 'NICA Sanctioned',
                body: 'We compete in the official National Interscholastic Cycling Association league, following guidelines that prioritize safety, inclusivity, and fun.',
              },
              {
                icon: <MapPin className="h-6 w-6" />,
                title: 'Sonoma County Roots',
                body: "Based in Sonoma County, we're proud to ride the trails and represent the community we love — from Annadel State Park and beyond.",
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-brand-100 hover:bg-brand-50/30 transition-colors group"
              >
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-brand-600 text-white group-hover:bg-brand-700 transition-colors">
                  {icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is NICA */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-600 bg-brand-50 rounded-full uppercase tracking-wider mb-4">
                About NICA
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What is NICA?
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                The National Interscholastic Cycling Association (NICA) is a nonprofit that develops youth character through mountain bike programs for students in grades 6–12.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                With thousands of teams across the country, NICA is the fastest-growing youth sport in America. Every race, every practice, every trail ride is about more than competition — it's about growing confident, resilient young people.
              </p>
              <div className="flex flex-wrap gap-3">
                {['6th–12th Grade', 'All Skill Levels', 'Co-ed Teams', 'Season Racing'].map(tag => (
                  <span key={tag} className="px-3 py-1 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: '150+', desc: 'Student Athletes on our team' },
                { num: '80+',  desc: 'Volunteer coaches' },
                { num: '3',    desc: 'Seasons of racing' },
                { num: '#1',   desc: 'Reason to ride: fun' },
              ].map(({ num, desc }) => (
                <div key={desc} className="flex flex-col justify-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                  <div className="text-3xl font-extrabold text-brand-600 mb-1">{num}</div>
                  <div className="text-sm text-gray-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portal CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-brand-600 to-brand-900">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Already on the team?
          </h2>
          <p className="text-brand-200 text-lg mb-8">
            Access schedules, event RSVPs, team announcements, the roster, and more in the team portal.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-brand-700 bg-white rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
          >
            Sign in to the Portal
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Donate CTA */}
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
            <Heart className="h-4 w-4" />
            Donate to the Team
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo.png" alt="Annadel Composite" width={100} height={34} className="object-contain opacity-60" />
          <p className="text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Annadel Composite Mountain Bike Team · NICA
          </p>
          <div className="flex items-center gap-4">
            <Link href="/donate" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Donate</Link>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Team Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
