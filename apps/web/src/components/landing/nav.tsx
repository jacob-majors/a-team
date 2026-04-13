'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ChevronRight, Menu, X } from 'lucide-react'

const LINKS = [
  { label: 'Schools',  href: '/schools' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Donate',   href: '/donate' },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3.5 sm:px-8 lg:px-16 transition-colors duration-300 ${
          scrolled ? 'bg-brand-950/92 backdrop-blur-md' : 'bg-transparent'
        }`}
      >
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Annadel Composite"
            width={100}
            height={34}
            className="object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
            priority
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-brand-950 bg-white rounded-lg hover:bg-brand-50 transition-colors shadow-sm"
          >
            Team Portal <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="p-1 text-white/80 transition-colors hover:text-white md:hidden"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed inset-0 z-40 bg-brand-950 flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className="absolute right-5 top-5 text-white/60 hover:text-white sm:right-8"
          onClick={() => setMenuOpen(false)}
        >
          <X className="h-6 w-6" />
        </button>
        {LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={() => setMenuOpen(false)}
            className="text-3xl font-black text-white/70 hover:text-white transition-colors"
          >
            {label}
          </Link>
        ))}
        <Link
          href="/sign-in"
          onClick={() => setMenuOpen(false)}
          className="mt-2 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-brand-950 bg-white rounded-xl hover:bg-brand-50 transition-colors"
        >
          Team Portal <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/donate"
          onClick={() => setMenuOpen(false)}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-300 hover:text-brand-200 transition-colors"
        >
          <Heart className="h-4 w-4" /> Support the Team
        </Link>
      </div>
    </>
  )
}
