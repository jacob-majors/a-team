'use client'

import Link from 'next/link'
import { sponsors } from '@/app/sponsors/data'

export function SponsorsMarquee() {
  // Duplicate the list for a seamless loop
  const doubled = [...sponsors, ...sponsors]

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex gap-4"
        style={{
          width: 'max-content',
          animation: 'sponsors-marquee 50s linear infinite',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused')}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.animationPlayState = 'running')}
      >
        {doubled.map((sponsor, i) => (
          <Link
            key={`${sponsor.name}-${i}`}
            href="/sponsors"
            title={sponsor.name}
            className="group flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border border-gray-100 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-300 w-28"
          >
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-xs font-bold tracking-tight shadow-sm group-hover:scale-110 transition-transform duration-300"
              style={{ backgroundColor: sponsor.color, color: sponsor.textColor }}
            >
              {sponsor.initials}
            </div>
            <span className="text-xs text-gray-500 text-center leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors">
              {sponsor.name}
            </span>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes sponsors-marquee {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
      `}</style>
    </div>
  )
}
