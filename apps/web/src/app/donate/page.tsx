import Image from 'next/image'
import Link from 'next/link'
import { Heart, ChevronRight, Users, Trophy, Wrench, TreePine, Star } from 'lucide-react'

const tiers = [
  {
    name: 'Trail Supporter',
    amount: '$25',
    frequency: 'one-time',
    description: 'Every dollar helps keep our riders on the trail.',
    perks: ['Thank-you shoutout in team newsletter', 'Good vibes from 150+ riders'],
    color: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    icon: <TreePine className="h-5 w-5" />,
    cta: 'Give $25',
    highlight: false,
  },
  {
    name: 'Race Day Backer',
    amount: '$100',
    frequency: 'one-time',
    description: 'Help cover entry fees so no rider misses a race.',
    perks: [
      'Name listed on team website',
      'Team sticker pack',
      'Thank-you in race day program',
    ],
    color: 'border-gray-200',
    badge: 'bg-blue-100 text-blue-700',
    icon: <Trophy className="h-5 w-5" />,
    cta: 'Give $100',
    highlight: false,
  },
  {
    name: 'Team Sponsor',
    amount: '$250',
    frequency: 'one-time',
    description: 'A meaningful contribution that keeps the whole program rolling.',
    perks: [
      'Logo on team jersey (season)',
      'Social media shoutout',
      'VIP race day experience',
      'All previous perks',
    ],
    color: 'border-brand-400 ring-2 ring-brand-400',
    badge: 'bg-brand-600 text-white',
    icon: <Star className="h-5 w-5" />,
    cta: 'Give $250',
    highlight: true,
  },
  {
    name: 'Coach Patron',
    amount: '$500',
    frequency: 'one-time',
    description: 'Help train and equip our 80+ volunteer coaches.',
    perks: [
      'Prominent logo on team kit',
      'Named coaching clinic sponsor',
      'Season-long social recognition',
      'All previous perks',
    ],
    color: 'border-gray-200',
    badge: 'bg-purple-100 text-purple-700',
    icon: <Users className="h-5 w-5" />,
    cta: 'Give $500',
    highlight: false,
  },
  {
    name: 'Equipment Angel',
    amount: '$1,000',
    frequency: 'one-time',
    description: 'Fund a full set of gear or a fleet of loaner bikes for new riders.',
    perks: [
      'Named equipment donation',
      'Banner at team events',
      'Featured story in newsletter',
      'All previous perks',
    ],
    color: 'border-gray-200',
    badge: 'bg-orange-100 text-orange-700',
    icon: <Wrench className="h-5 w-5" />,
    cta: 'Give $1,000',
    highlight: false,
  },
  {
    name: 'Founding Sponsor',
    amount: 'Custom',
    frequency: 'annual',
    description: 'Partner with us at the highest level. Let\'s talk.',
    perks: [
      'Title sponsorship naming rights',
      'Custom partnership agreement',
      'Event co-branding',
      'All previous perks',
    ],
    color: 'border-gray-900',
    badge: 'bg-gray-900 text-white',
    icon: <Heart className="h-5 w-5" />,
    cta: 'Contact Us',
    highlight: false,
  },
]

const impactItems = [
  { amount: '$25',   impact: 'Covers trail maintenance fee for one rider' },
  { amount: '$50',   impact: 'Pays for a full set of race numbers + plates' },
  { amount: '$100',  impact: 'Funds race entry fees for one athlete' },
  { amount: '$250',  impact: 'Sponsors a coaching certification workshop' },
  { amount: '$500',  impact: 'Provides a loaner helmet + pads for a new rider' },
  { amount: '$1,000', impact: 'Purchases a loaner bike for a student in need' },
]

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Annadel Composite" width={120} height={40} className="object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
            Home
          </Link>
          <Link href="/sponsors" className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">
            Sponsors
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
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-brand-50" />
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-brand-600 text-white mb-6 mx-auto shadow-lg">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            Support the Team
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Your donation directly funds bikes, gear, race fees, and coaching for 150+ student athletes at Annadel Composite.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <span className="px-3 py-1 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">501(c)(3) Nonprofit</span>
            <span className="px-3 py-1 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">Tax Deductible</span>
            <span className="px-3 py-1 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-full">NICA Member Team</span>
          </div>
        </div>
      </section>

      {/* Donation tiers */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Choose Your Impact</h2>
            <p className="mt-2 text-gray-500">Every level makes a real difference for our riders.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border-2 p-6 transition-shadow hover:shadow-lg ${tier.color} ${tier.highlight ? 'bg-brand-50/30' : 'bg-white'}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white bg-brand-600 rounded-full shadow-sm whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${tier.badge}`}>
                    {tier.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{tier.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{tier.frequency}</div>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-gray-900 mb-2">{tier.amount}</div>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">{tier.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
                      : tier.name === 'Founding Sponsor'
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'border border-brand-600 text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-400">
            Donation processing coming soon. For immediate donations, contact your team director.
          </p>
        </div>
      </section>

      {/* Impact breakdown */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Where Your Money Goes</h2>
            <p className="mt-2 text-gray-500">100% of donations go directly to the program.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {impactItems.map(({ amount, impact }) => (
              <div key={amount} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex-shrink-0 w-16 text-center">
                  <span className="text-lg font-extrabold text-brand-600">{amount}</span>
                </div>
                <p className="text-sm text-gray-600">{impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other ways to help */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Other Ways to Help</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Volunteer',
                desc: 'Join our team of 80+ coaches and volunteer leads. No experience required — just a passion for youth sports.',
                cta: 'Learn More',
              },
              {
                title: 'Donate Equipment',
                desc: 'Bikes, helmets, tools, and gear in good condition go a long way for families new to the sport.',
                cta: 'Contact Us',
              },
              {
                title: 'Spread the Word',
                desc: 'Share our mission with your network. Every new rider and sponsor helps the whole team thrive.',
                cta: 'Share',
              },
            ].map(({ title, desc, cta }) => (
              <div key={title} className="flex flex-col p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50/20 transition-colors">
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 flex-1 mb-4">{desc}</p>
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors text-left">
                  {cta} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 border-t border-gray-100">
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
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Team Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
