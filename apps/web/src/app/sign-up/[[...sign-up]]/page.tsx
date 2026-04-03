'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || location.origin

  async function handleGoogle() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${siteUrl}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900" />
        <div className="absolute inset-0 backdrop-blur-sm" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-800/50 blur-3xl" />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mb-6 flex justify-center">
            <Image src="/logo.png" alt="A-Team" width={140} height={48} className="object-contain brightness-0 invert" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
          <p className="text-sm text-white/70">
            We sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/sign-in" className="mt-6 inline-block text-sm font-medium text-white/80 hover:text-white">
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900" />
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-800/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="A-Team Annadel Composite" width={160} height={54} className="object-contain brightness-0 invert" />
        </div>

        <h1 className="mb-1 text-center text-xl font-bold text-white">Create your account</h1>
        <p className="mb-6 text-center text-sm text-white/70">Join the A-Team</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Full name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Rider"
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-brand-700 hover:bg-white/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 border-t border-white/20" />
          <span className="text-xs text-white/50">or</span>
          <div className="flex-1 border-t border-white/20" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-3 rounded-lg border border-white/30 bg-white/10 py-2.5 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50 transition-colors backdrop-blur-sm"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-white hover:text-white/80">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
