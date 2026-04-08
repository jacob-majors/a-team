'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ChevronRight } from 'lucide-react'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? 'px-6 py-2.5 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'px-6 py-5 bg-transparent'
      }`}
    >
      {/* Logo — white on hero, brand on scroll */}
      <Link href="/" className="flex items-center">
        <Image
          src="/logo.png"
          alt="Annadel Composite"
          width={scrolled ? 100 : 130}
          height={36}
          className={`object-contain transition-all duration-300 ${scrolled ? '' : 'brightness-0 invert'}`}
          priority
        />
      </Link>

      {/* Links */}
      <div className="flex items-center gap-4">
        <Link
          href="/schools"
          className={`hidden md:inline text-sm font-medium transition-colors ${
            scrolled ? 'text-gray-500 hover:text-brand-600' : 'text-white/80 hover:text-white'
          }`}
        >
          Schools
        </Link>
        <Link
          href="/sponsors"
          className={`hidden md:inline text-sm font-medium transition-colors ${
            scrolled ? 'text-gray-500 hover:text-brand-600' : 'text-white/80 hover:text-white'
          }`}
        >
          Sponsors
        </Link>
        <Link
          href="/donate"
          className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
            scrolled
              ? 'text-brand-600 border-brand-300 hover:bg-brand-50'
              : 'text-white border-white/40 hover:bg-white/10'
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          Donate
        </Link>
        <Link
          href="/sign-in"
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors shadow-sm ${
            scrolled
              ? 'text-white bg-brand-600 hover:bg-brand-700'
              : 'text-brand-700 bg-white hover:bg-brand-50'
          }`}
        >
          Team Portal
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  )
}
