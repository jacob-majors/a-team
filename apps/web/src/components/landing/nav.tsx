'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ChevronRight, Menu, X } from 'lucide-react'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? 'px-6 py-2 bg-brand-900/95 backdrop-blur-md shadow-lg'
            : 'px-6 py-4 bg-transparent'
        }`}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Annadel Composite"
            width={110}
            height={38}
            className="object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          {['Schools', 'Sponsors', 'Coaches'].map(label => (
            <Link
              key={label}
              href={`/${label.toLowerCase()}`}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/donate"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Heart className="h-3.5 w-3.5" /> Donate
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-brand-900 bg-white rounded-lg hover:bg-brand-50 transition-colors shadow-sm"
          >
            Team Portal <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-900/97 backdrop-blur-md flex flex-col items-center justify-center gap-6 md:hidden">
          <button className="absolute top-5 right-6 text-white" onClick={() => setMenuOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          {[
            { label: 'Schools', href: '/schools' },
            { label: 'Sponsors', href: '/sponsors' },
            { label: 'Donate', href: '/donate' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-2xl font-semibold text-white/80 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            onClick={() => setMenuOpen(false)}
            className="mt-4 inline-flex items-center gap-2 px-8 py-3 text-base font-semibold text-brand-900 bg-white rounded-xl hover:bg-brand-50 transition-colors"
          >
            Team Portal <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </>
  )
}
