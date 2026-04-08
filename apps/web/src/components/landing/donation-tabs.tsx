'use client'

import { useState } from 'react'
import { Heart, RefreshCw } from 'lucide-react'

const ONE_TIME = [
  { amount: '$25',    label: 'Trail Supporter',  desc: 'Covers trail maintenance fee for one rider' },
  { amount: '$50',    label: 'Gear Fund',         desc: 'Pays for race numbers and plates' },
  { amount: '$100',   label: 'Race Day Backer',   desc: 'Covers race entry fees for one athlete' },
  { amount: '$250',   label: 'Team Sponsor',      desc: 'Sponsors a coaching certification workshop', highlight: true },
  { amount: '$500',   label: 'Coach Patron',      desc: 'Equips a coach with training resources' },
  { amount: '$1,000', label: 'Equipment Angel',   desc: 'Purchases a loaner bike for a student' },
]

const RECURRING = [
  { amount: '$5/mo',   label: 'Trail Friend',    desc: '$60/year — keeps one rider on the trail' },
  { amount: '$10/mo',  label: 'Steady Supporter',desc: '$120/year — helps cover gear maintenance' },
  { amount: '$25/mo',  label: 'Team Backer',     desc: '$300/year — funds race entries', highlight: true },
  { amount: '$50/mo',  label: 'Season Sponsor',  desc: '$600/year — supports a rider for a full season' },
  { amount: '$100/mo', label: 'Head Patron',     desc: '$1,200/year — funds equipment and coaching' },
]

export function DonationTabs() {
  const [tab, setTab] = useState<'one-time' | 'recurring'>('one-time')
  const tiers = tab === 'one-time' ? ONE_TIME : RECURRING

  return (
    <div className="mx-auto max-w-4xl">
      {/* Tab toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-xl bg-white/10 border border-white/20 p-1 gap-1">
          <button
            onClick={() => setTab('one-time')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'one-time'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" />
            One-time
          </button>
          <button
            onClick={() => setTab('recurring')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'recurring'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            Monthly
          </button>
        </div>
      </div>

      {/* Tier grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier) => (
          <div
            key={tier.amount}
            className={`relative flex flex-col p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
              'highlight' in tier && tier.highlight
                ? 'border-white/60 bg-white/15'
                : 'border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/40'
            }`}
          >
            {'highlight' in tier && tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-bold text-brand-700 bg-white rounded-full shadow-sm whitespace-nowrap">
                Most Popular
              </div>
            )}
            <div className="text-2xl font-extrabold text-white mb-1">{tier.amount}</div>
            <div className="text-sm font-semibold text-white/90 mb-1">{tier.label}</div>
            <div className="text-xs text-white/60 leading-snug flex-1">{tier.desc}</div>
            <div className="mt-4 py-2 px-4 rounded-xl bg-white/10 border border-white/20 text-center text-xs font-semibold text-white group-hover:bg-white group-hover:text-brand-700 transition-colors">
              {tab === 'one-time' ? `Give ${tier.amount}` : `Give ${tier.amount}`}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        Donation processing setup in progress. Contact your team director to give now.
      </p>
    </div>
  )
}
