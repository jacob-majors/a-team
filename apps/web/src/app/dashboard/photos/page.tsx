'use client'

import { ExternalLink, Check, X, Zap, DollarSign } from 'lucide-react'
import { cn } from '@a-team/utils'

interface Option {
  name: string
  tagline: string
  logo: string
  pricing: { label: string; detail: string }[]
  pros: string[]
  cons: string[]
  bestFor: string
  docsUrl: string
  badge?: { label: string; color: string }
}

const OPTIONS: Option[] = [
  {
    name: 'Cloudinary',
    tagline: 'Media management platform with transforms built in',
    logo: '☁️',
    badge: { label: 'Recommended', color: 'bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' },
    pricing: [
      { label: 'Free tier',      detail: '25 credits/mo (~25 GB storage + 25 GB bandwidth)' },
      { label: 'Plus',           detail: '$89/mo — 225 credits' },
      { label: 'Pay-as-you-go',  detail: '~$0.04/GB storage, $0.08/GB delivery' },
    ],
    pros: [
      'Auto-resize & optimize images on the fly via URL params',
      'Built-in face detection, cropping, and watermarking',
      'CDN delivery globally — fast everywhere',
      'React upload widget ready to drop in — minimal code',
      'Free tier is generous for a small team',
      'Direct browser upload — no backend needed',
    ],
    cons: [
      'Pricing jumps sharply past the free tier',
      'Vendor lock-in (proprietary transform URL format)',
      'Credit system can be hard to predict cost at scale',
    ],
    bestFor: 'Best if you want automatic image optimization and resizing without writing any backend code. The free tier covers a team this size easily.',
    docsUrl: 'https://cloudinary.com/documentation',
  },
  {
    name: 'Supabase Storage',
    tagline: 'S3-compatible object storage — already in your stack',
    logo: '⚡',
    badge: { label: 'Already set up', color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300' },
    pricing: [
      { label: 'Free tier',     detail: '1 GB storage + 2 GB bandwidth included' },
      { label: 'Pro ($25/mo)',  detail: '100 GB storage, 200 GB bandwidth included' },
      { label: 'Overage',       detail: '$0.021/GB storage, $0.09/GB egress' },
    ],
    pros: [
      'Zero extra accounts — uses your existing Supabase project',
      'Row-level security policies work on storage buckets too',
      'Direct upload from the browser with the Supabase client',
      'Image transformations available on Pro plan',
      'Tight auth integration — restrict who can upload/view',
    ],
    cons: [
      'Free tier storage is tiny (1 GB fills up fast with photos)',
      'Image transforms are limited compared to Cloudinary',
      'No CDN on free tier — slower delivery for remote users',
      'Best for small or medium photo libraries only',
    ],
    bestFor: "Best if you want everything in one place and don't need heavy image processing. Easiest to set up since it's already connected.",
    docsUrl: 'https://supabase.com/docs/guides/storage',
  },
  {
    name: 'AWS S3 + CloudFront',
    tagline: 'Industry-standard object storage with global CDN',
    logo: '🟠',
    pricing: [
      { label: 'S3 storage',   detail: '$0.023/GB/mo (first 50 TB)' },
      { label: 'CloudFront',   detail: '$0.0085/GB delivery (first 10 TB)' },
      { label: 'Free tier',    detail: '5 GB storage + 15 GB egress free for 12 months' },
    ],
    pros: [
      'Extremely reliable — 99.999999999% (11 nines) durability',
      'Virtually unlimited storage at low per-GB cost',
      'CloudFront CDN is among the fastest globally',
      'Fine-grained IAM permission controls',
      'Works with Lambda for server-side image processing',
    ],
    cons: [
      'Most complex to set up — IAM roles, CORS, bucket policies',
      'No image transforms without adding Lambda or imgix on top',
      'Cost is unpredictable without monitoring and budgets set up',
      'Overkill for a team app at this scale',
    ],
    bestFor: 'Best if you already use AWS or expect thousands of high-res race photos and need long-term archival. Not worth the setup hassle for a team this size.',
    docsUrl: 'https://docs.aws.amazon.com/s3/',
  },
  {
    name: 'imgix',
    tagline: 'Real-time image processing CDN — pairs with any storage',
    logo: '🖼️',
    pricing: [
      { label: 'Starter',   detail: '$10/mo — 1,000 master images, 100 GB delivery' },
      { label: 'Growth',    detail: '$35/mo — 10,000 images, 500 GB delivery' },
      { label: 'Overage',   detail: '$0.08/GB delivery' },
    ],
    pros: [
      'Extremely fast transforms via URL params (like Cloudinary)',
      'Works on top of S3 or any existing storage provider',
      'Excellent image quality algorithms and format conversion',
      'Simple, predictable pricing',
    ],
    cons: [
      'Not a storage provider — still need S3 or similar for files',
      'Adds another vendor to manage and pay separately',
      'Pricier than Cloudinary at small scale',
      'Extra setup complexity pairing it with another service',
    ],
    bestFor: 'Best if you already have S3 and want Cloudinary-style transforms without moving your files to a new platform.',
    docsUrl: 'https://docs.imgix.com',
  },
]

const COMPARISON: { label: string; cloudinary: boolean | string; supabase: boolean | string; aws: boolean | string; imgix: boolean | string }[] = [
  { label: 'Easy setup',           cloudinary: true,    supabase: true,    aws: false,   imgix: false  },
  { label: 'Auto image resize',    cloudinary: true,    supabase: 'Pro',   aws: false,   imgix: true   },
  { label: 'CDN included',         cloudinary: true,    supabase: 'Pro',   aws: '+add',  imgix: true   },
  { label: 'Auth integration',     cloudinary: false,   supabase: true,    aws: false,   imgix: false  },
  { label: 'No extra account',     cloudinary: false,   supabase: true,    aws: false,   imgix: false  },
  { label: 'Generous free tier',   cloudinary: true,    supabase: false,   aws: '12mo',  imgix: false  },
  { label: 'Scales to thousands',  cloudinary: true,    supabase: false,   aws: true,    imgix: true   },
]

function CellValue({ val }: { val: boolean | string }) {
  if (val === true)  return <Check className="h-4 w-4 text-green-500 mx-auto" />
  if (val === false) return <X className="h-4 w-4 text-[rgb(var(--border))] mx-auto" />
  return <span className="text-xs font-medium text-[rgb(var(--text-muted))]">{val}</span>
}

export default function PhotosPage() {
  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Photo Storage</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))] max-w-2xl">
          This feature isn't built yet. Below is a breakdown of the best options for hosting team photos —
          comparing ease of setup, image processing, CDN delivery, and cost so you can pick the right one before building it out.
        </p>
      </div>

      {/* Option cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {OPTIONS.map(opt => (
          <div key={opt.name}
            className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] overflow-hidden shadow-sm flex flex-col">

            {/* Card header */}
            <div className="px-6 pt-5 pb-4 border-b border-[rgb(var(--border))]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.logo}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-[rgb(var(--text))] text-lg leading-tight">{opt.name}</h2>
                      {opt.badge && (
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', opt.badge.color)}>
                          {opt.badge.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[rgb(var(--text-muted))] mt-0.5">{opt.tagline}</p>
                  </div>
                </div>
                <a href={opt.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 rounded-lg border border-[rgb(var(--border))] p-1.5 text-[rgb(var(--text-muted))] hover:text-brand-500 hover:border-brand-400 transition-colors"
                  title="View docs">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="px-6 py-4 space-y-5 flex-1">
              {/* Pricing */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <DollarSign className="h-3.5 w-3.5 text-[rgb(var(--text-muted))]" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">Pricing</span>
                </div>
                <div className="space-y-1.5">
                  {opt.pricing.map(p => (
                    <div key={p.label} className="flex gap-2 text-sm">
                      <span className="font-medium text-[rgb(var(--text))] shrink-0 w-28">{p.label}</span>
                      <span className="text-[rgb(var(--text-muted))]">{p.detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">Pros</span>
                </div>
                <ul className="space-y-1.5">
                  {opt.pros.map(p => (
                    <li key={p} className="flex items-start gap-2 text-sm text-[rgb(var(--text-muted))]">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />{p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--text-muted))]">Cons</span>
                </div>
                <ul className="space-y-1.5">
                  {opt.cons.map(c => (
                    <li key={c} className="flex items-start gap-2 text-sm text-[rgb(var(--text-muted))]">
                      <X className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />{c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best for */}
              <div className="rounded-xl bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))] px-4 py-3 mt-auto">
                <p className="text-xs font-semibold text-[rgb(var(--text-muted))] uppercase tracking-wide mb-1">Best for</p>
                <p className="text-sm text-[rgb(var(--text))]">{opt.bestFor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div>
        <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-4">Side-by-Side Comparison</h2>
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--surface))] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))]">
                  <th className="px-5 py-3 text-left font-medium text-[rgb(var(--text-muted))] w-48">Feature</th>
                  {OPTIONS.map(o => (
                    <th key={o.name} className="px-4 py-3 text-center font-semibold text-[rgb(var(--text))] whitespace-nowrap">
                      {o.logo} {o.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {COMPARISON.map(row => (
                  <tr key={row.label} className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
                    <td className="px-5 py-3 font-medium text-[rgb(var(--text))]">{row.label}</td>
                    <td className="px-4 py-3 text-center"><CellValue val={row.cloudinary} /></td>
                    <td className="px-4 py-3 text-center"><CellValue val={row.supabase} /></td>
                    <td className="px-4 py-3 text-center"><CellValue val={row.aws} /></td>
                    <td className="px-4 py-3 text-center"><CellValue val={row.imgix} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendation callout */}
      <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/30 px-6 py-5">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[rgb(var(--text))]">Recommendation for A-Team</p>
            <p className="mt-1 text-sm text-[rgb(var(--text-muted))] leading-relaxed">
              Start with <strong className="text-[rgb(var(--text))]">Supabase Storage</strong> since it's already connected,
              requires no new accounts, and integrates cleanly with your existing auth and RLS policies.
              It's free up to 1 GB which is fine for getting started.
              Once the photo library grows, or if you want automatic thumbnail resizing,
              switch to <strong className="text-[rgb(var(--text))]">Cloudinary's free tier</strong> — 25 GB is more than enough
              for a team this size and the React upload widget is nearly plug-and-play.
              AWS S3 is overkill unless you plan to archive thousands of high-res race photos long-term.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
