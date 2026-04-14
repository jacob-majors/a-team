import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Heart, Check, X, AlertTriangle, Info } from 'lucide-react'
import { DonationTabs } from '@/components/landing/donation-tabs'

type Processor = {
  name: string
  tagline: string
  color: string
  textColor: string
  initials: string
  url: string
  fee: string
  feeDetail: string
  setup: string
  nonprofit: string | null
  recurring: boolean
  instantPayout: boolean
  taxReceipt: boolean
  recommended: boolean
  verdict: 'best' | 'good' | 'ok' | 'skip'
  verdictLabel: string
  pros: string[]
  cons: string[]
  note?: string
}

const processors: Processor[] = [
  {
    name: 'Stripe',
    tagline: 'Developer-first payments platform',
    color: '#635bff',
    textColor: '#ffffff',
    initials: 'S',
    url: 'https://stripe.com',
    fee: '2.9% + $0.30',
    feeDetail: 'per transaction. Nonprofit rate: 2.2% + $0.30 via Stripe for Nonprofits (must apply)',
    setup: 'Moderate — requires dev or third-party integration',
    nonprofit: '2.2% + $0.30 (apply via Stripe for Nonprofits)',
    recurring: true,
    instantPayout: false,
    taxReceipt: false,
    recommended: true,
    verdict: 'best',
    verdictLabel: 'Best overall',
    pros: [
      'Lowest fees with nonprofit discount',
      'Excellent recurring donation support',
      'Embeds directly in your website',
      'Highly customizable',
      'Trusted by major nonprofits',
    ],
    cons: [
      'Requires dev work or a tool like Donorbox',
      'Tax receipts need a third-party add-on',
      'Must apply for nonprofit rate',
    ],
    note: 'Pair with Donorbox ($0/mo free tier) for a plug-and-play donate form that uses Stripe under the hood.',
  },
  {
    name: 'PayPal Giving Fund',
    tagline: 'Free nonprofit donations via PayPal',
    color: '#003087',
    textColor: '#ffffff',
    initials: 'PP',
    url: 'https://www.paypal.com/us/webapps/mpp/givingfund',
    fee: '0%',
    feeDetail: 'PayPal covers all fees for enrolled nonprofits. Standard PayPal rate (2.89% + $0.49) applies if not enrolled.',
    setup: 'Easy — enroll nonprofit, add button to site',
    nonprofit: '0% if enrolled in PayPal Giving Fund',
    recurring: true,
    instantPayout: false,
    taxReceipt: true,
    recommended: true,
    verdict: 'best',
    verdictLabel: 'Best free option',
    pros: [
      'Zero fees for verified nonprofits',
      'Automatic tax receipts to donors',
      'Donors already have PayPal accounts',
      'Easy embed button',
    ],
    cons: [
      'Must be registered 501(c)(3)',
      'Slower payouts (can take weeks)',
      'Less customizable than Stripe',
      'PayPal holds funds until disbursement',
    ],
    note: 'Best if you are a verified 501(c)(3). Payouts go directly to your nonprofit account.',
  },
  {
    name: 'Venmo',
    tagline: 'Simple peer-to-peer payments',
    color: '#3d95ce',
    textColor: '#ffffff',
    initials: 'V',
    url: 'https://venmo.com',
    fee: '1.9% + $0.10',
    feeDetail: 'for business/nonprofit profiles. No fee for personal (but personal accounts lack tracking/receipts).',
    setup: 'Very easy — just share your handle',
    nonprofit: null,
    recurring: false,
    instantPayout: true,
    taxReceipt: false,
    recommended: false,
    verdict: 'ok',
    verdictLabel: 'OK for casual',
    pros: [
      'Extremely easy for donors to use',
      'Instant payouts',
      'Very familiar to parents and families',
    ],
    cons: [
      'No tax receipts',
      'No recurring donations',
      'No donation management dashboard',
      'Not designed for nonprofits',
      'No donor data / reporting',
    ],
    note: 'Fine for quick fundraisers but not scalable for a team of 150+ riders.',
  },
  {
    name: 'Donorbox',
    tagline: 'Nonprofit-first fundraising platform',
    color: '#00aa7b',
    textColor: '#ffffff',
    initials: 'DB',
    url: 'https://donorbox.org',
    fee: '1.5% platform + Stripe/PayPal fees',
    feeDetail: '1.5% Donorbox fee on top of Stripe (2.2% nonprofit) or PayPal. Free plan available up to $1,000/mo.',
    setup: 'Very easy — embed form, no dev needed',
    nonprofit: 'Yes — built for nonprofits, integrates Stripe nonprofit rate',
    recurring: true,
    instantPayout: false,
    taxReceipt: true,
    recommended: true,
    verdict: 'best',
    verdictLabel: 'Easiest to set up',
    pros: [
      'Purpose-built for nonprofits',
      'Automatic tax receipts',
      'Recurring donations built-in',
      'No dev work — just copy embed code',
      'Donor management dashboard',
      'Free up to $1,000/month raised',
    ],
    cons: [
      '1.5% platform fee on top of payment processing',
      'Free plan has Donorbox branding',
      'Paid plan starts at $139/mo for white-label',
    ],
    note: 'Recommended starting point — set up in under an hour, no code needed.',
  },
  {
    name: 'Give Lively',
    tagline: 'Free fundraising for nonprofits',
    color: '#ff5a5f',
    textColor: '#ffffff',
    initials: 'GL',
    url: 'https://www.givelively.org',
    fee: '0% platform fee',
    feeDetail: 'Give Lively charges nothing. Only standard Stripe processing fees (2.2% + $0.30 for nonprofits).',
    setup: 'Easy — free account, embed on website',
    nonprofit: 'Nonprofit-only platform (must verify)',
    recurring: true,
    instantPayout: false,
    taxReceipt: true,
    recommended: true,
    verdict: 'best',
    verdictLabel: 'Best free nonprofit tool',
    pros: [
      'Zero platform fees — ever',
      'Automatic tax receipts',
      'Recurring donations',
      'Peer-to-peer fundraising pages',
      'Embeds on your website',
      'Free donor management',
    ],
    cons: [
      'Must be a verified 501(c)(3)',
      'Less customizable than Stripe',
      'Smaller company — less support resources',
    ],
    note: 'Seriously great option if you have nonprofit status. No catch — they are funded by Salesforce.',
  },
  {
    name: 'GoFundMe',
    tagline: 'Crowdfunding for campaigns',
    color: '#02a95c',
    textColor: '#ffffff',
    initials: 'GFM',
    url: 'https://www.gofundme.com',
    fee: '0% + payment processing',
    feeDetail: '0% platform fee. Payment processing: 2.9% + $0.30. Donors can optionally cover fees.',
    setup: 'Extremely easy — create a campaign page',
    nonprofit: null,
    recurring: false,
    instantPayout: false,
    taxReceipt: false,
    recommended: false,
    verdict: 'ok',
    verdictLabel: 'Good for campaigns',
    pros: [
      'No platform fee',
      'Easy to share and go viral',
      'Great for one-time fundraising drives',
      'No setup required',
    ],
    cons: [
      'No tax receipts',
      'Not designed for ongoing giving',
      'Funds held — slower payouts',
      'No donor relationship management',
      'Looks informal vs. a proper donate page',
    ],
    note: 'Best for a specific campaign (e.g. "New trailer fund") not ongoing team support.',
  },
  {
    name: 'Square',
    tagline: 'POS and online payments',
    color: '#1a1a1a',
    textColor: '#ffffff',
    initials: 'SQ',
    url: 'https://squareup.com',
    fee: '2.6% + $0.15 (in-person), 2.9% + $0.30 (online)',
    feeDetail: 'No nonprofit discount. In-person rate is competitive. Online is standard.',
    setup: 'Easy — good for in-person race day collection',
    nonprofit: null,
    recurring: false,
    instantPayout: false,
    taxReceipt: false,
    recommended: false,
    verdict: 'ok',
    verdictLabel: 'Best in-person',
    pros: [
      'Excellent for in-person donations at races/events',
      'Free card reader',
      'Instant setup',
    ],
    cons: [
      'No nonprofit discount',
      'No tax receipts',
      'No recurring donations',
      'Online donations less polished',
    ],
    note: 'Keep a Square reader at race registration for in-person donations — pairs well with Donorbox online.',
  },
]

const verdictColors: Record<string, string> = {
  best: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  ok:   'bg-amber-50 text-amber-700 border-amber-200',
  skip: 'bg-red-50 text-red-700 border-red-200',
}

const feeComparison = [
  { amount: 25,   label: '$25 donation' },
  { amount: 100,  label: '$100 donation' },
  { amount: 500,  label: '$500 donation' },
]

function calcFee(amount: number, pct: number, fixed: number) {
  return (amount * pct / 100 + fixed).toFixed(2)
}

const feeScenarios = [
  { name: 'Stripe (nonprofit)',    pct: 2.2, fixed: 0.30, color: '#635bff' },
  { name: 'PayPal Giving Fund',    pct: 0,   fixed: 0,    color: '#003087' },
  { name: 'Donorbox + Stripe NP',  pct: 3.7, fixed: 0.30, color: '#00aa7b' },
  { name: 'Give Lively',           pct: 2.2, fixed: 0.30, color: '#ff5a5f' },
  { name: 'Standard Stripe',       pct: 2.9, fixed: 0.30, color: '#888' },
]

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Annadel Composite" width={110} height={38} className="object-contain" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Home</Link>
          <Link href="/sponsors" className="hidden sm:inline text-sm font-medium text-gray-500 hover:text-brand-600 transition-colors">Sponsors</Link>
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm">
            Team Portal <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {/* Hero + donation tabs */}
      <section className="pt-28 pb-14 px-6 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        <div className="mx-auto max-w-3xl text-center mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/20 text-white mb-5 mx-auto">
            <Heart className="h-7 w-7" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Support Annadel Composite
          </h1>
          <p className="text-brand-100/80 text-lg max-w-xl mx-auto">
            Your donation funds bikes, gear, race fees, and coaching for 150+ student athletes.
          </p>
        </div>
        <DonationTabs />
      </section>

      {/* Quick recommendation banner */}
      <section className="px-6 py-6 bg-emerald-50 border-b border-emerald-200">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-600 text-white">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Our recommendation: Start with <span className="underline">Donorbox</span> (free tier) or <span className="underline">Give Lively</span> if you have 501(c)(3) status.</p>
            <p className="text-xs text-emerald-700 mt-0.5">Both take under an hour to set up, require no coding, and handle tax receipts automatically.</p>
          </div>
        </div>
      </section>

      {/* Fee comparison table */}
      <section className="py-14 px-6 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Fee Comparison</h2>
            <p className="mt-2 text-gray-500 text-sm">What actually reaches the team per donation amount</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-semibold text-gray-700">Processor</th>
                  {feeComparison.map(({ label }) => (
                    <th key={label} className="text-center px-4 py-3 font-semibold text-gray-700">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feeScenarios.map(({ name, pct, fixed, color }) => (
                  <tr key={name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-medium text-gray-800">{name}</span>
                      </div>
                    </td>
                    {feeComparison.map(({ amount }) => {
                      const fee = parseFloat(calcFee(amount, pct, fixed))
                      const net = (amount - fee).toFixed(2)
                      return (
                        <td key={amount} className="px-4 py-3 text-center">
                          <span className="font-semibold text-gray-900">${net}</span>
                          <span className="text-xs text-gray-400 ml-1">(−${fee.toFixed(2)})</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-400 text-center">* Donorbox adds 1.5% platform fee on top of Stripe nonprofit rate (2.2%), totaling ~3.7%. Still lower than standard Stripe.</p>
        </div>
      </section>

      {/* Processor cards */}
      <section className="py-8 px-6 bg-gray-50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Processor Breakdown</h2>
            <p className="mt-2 text-gray-500 text-sm">Every major option — pros, cons, and what it costs</p>
          </div>
          <div className="space-y-5">
            {processors.map((p) => (
              <div key={p.name} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${p.recommended ? 'border-gray-200' : 'border-gray-100'}`}>
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                      style={{ backgroundColor: p.color, color: p.textColor }}
                    >
                      {p.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{p.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${verdictColors[p.verdict]}`}>
                          {p.verdictLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{p.tagline}</p>
                    </div>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Visit site <ChevronRight className="h-3 w-3" />
                  </a>
                </div>

                {/* Body */}
                <div className="px-6 py-5 grid sm:grid-cols-3 gap-6">
                  {/* Fees */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Fees</p>
                    <p className="text-base font-bold text-gray-900">{p.fee}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{p.feeDetail}</p>
                    {p.nonprofit && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700 leading-snug">Nonprofit rate: {p.nonprofit}</p>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Features</p>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Recurring donations', val: p.recurring },
                        { label: 'Auto tax receipts',   val: p.taxReceipt },
                        { label: 'Instant payouts',     val: p.instantPayout },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex items-center gap-2">
                          {val
                            ? <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            : <X className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          }
                          <span className={`text-xs ${val ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pros & cons */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pros & Cons</p>
                    <ul className="space-y-1">
                      {p.pros.slice(0, 3).map(pro => (
                        <li key={pro} className="flex items-start gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{pro}</span>
                        </li>
                      ))}
                      {p.cons.slice(0, 2).map(con => (
                        <li key={con} className="flex items-start gap-1.5">
                          <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-400">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Note */}
                {p.note && (
                  <div className="mx-6 mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-brand-50 border border-brand-100">
                    <Info className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-brand-700 leading-snug">{p.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Setup checklist */}
      <section className="py-14 px-6 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Before You Set Up Donations</h2>
            <p className="mt-2 text-gray-500 text-sm">A few things to sort out first</p>
          </div>
          <div className="space-y-4">
            {[
              { icon: '🏛️', title: '501(c)(3) Status', body: 'Determines which platforms are available at no cost. PayPal Giving Fund and Give Lively require verified nonprofit status. Without it, you pay standard processing rates.', warn: false },
              { icon: '🏦', title: 'Bank Account', body: 'Donations need to land somewhere. Make sure the team has a dedicated bank account tied to the nonprofit EIN before going live with any processor.', warn: false },
              { icon: '⚠️', title: 'NICA / League Rules', body: 'Check with NorCal and NICA about any rules on fundraising, third-party platforms, or how donations are reported. Some leagues have specific requirements.', warn: true },
              { icon: '📋', title: 'Tax Receipts', body: 'Donors who give $250+ need a formal acknowledgment letter for IRS purposes. Donorbox, Give Lively, and PayPal Giving Fund handle this automatically.', warn: false },
              { icon: '💰', title: 'Platform Fees vs. Flat Fees', body: 'Percentage fees hurt most on large donations. If you expect many big sponsors ($1,000+), negotiate a flat or capped fee structure with the processor.', warn: false },
            ].map(({ icon, title, body, warn }) => (
              <div key={title} className={`flex gap-4 p-5 rounded-2xl border ${warn ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                    {warn && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
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
          <p className="text-sm text-gray-400 text-center">© {new Date().getFullYear()} Annadel Composite Mountain Bike Team · NICA</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Home</Link>
            <Link href="/sponsors" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Sponsors</Link>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-brand-600 transition-colors">Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
