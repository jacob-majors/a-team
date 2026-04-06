'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown } from 'lucide-react'

const IS_DEV = true // TODO: remove before going public

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'not_on_roster') {
      setError("Your email isn't on the team roster. Talk to your team director to get access.")
    } else if (err === 'auth_callback_failed') {
      setError('Sign-in failed. Please try again.')
    }
  }, [searchParams])

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) return
    setLoading(true)
    supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
      if (error) { setLoading(false); setError(error.message); return }
      checkRosterAndRedirect(data.user?.email ?? '')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof location !== 'undefined' ? location.origin : '')

  async function checkRosterAndRedirect(userEmail: string) {
    const { data } = await supabase
      .from('roster_members')
      .select('id')
      .ilike('email', userEmail)
      .maybeSingle()

    if (!data) {
      await supabase.auth.signOut()
      setLoading(false)
      setError("Your email isn't on the team roster. Talk to your team director to get access.")
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    setLoading(true)
    setError(null)
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) await checkRosterAndRedirect(data.user.email ?? '')
  }

  function handleDevLogin() {
    document.cookie = 'dev_bypass=1; path=/; max-age=86400'
    window.location.href = '/dashboard'
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900" />
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-300/40 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-800/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image src="/logo.png" alt="A-Team Annadel Composite" width={160} height={54}
            className="object-contain brightness-0 invert" />
        </div>

        <h1 className="mb-1 text-center text-xl font-bold text-white">Welcome back</h1>
        <p className="mb-6 text-center text-sm text-white/70">Sign in to your account</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/20 border border-red-400/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Primary: Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider + email toggle */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowEmail(v => !v)}
            className="w-full flex items-center gap-3 group"
          >
            <div className="flex-1 border-t border-white/20" />
            <span className="flex items-center gap-1 text-xs text-white/50 group-hover:text-white/70 transition-colors">
              Sign in with email
              <ChevronDown className={`h-3 w-3 transition-transform ${showEmail ? 'rotate-180' : ''}`} />
            </span>
            <div className="flex-1 border-t border-white/20" />
          </button>
        </div>

        {/* Email/password form — collapsible */}
        {showEmail && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-white/40 focus:border-white/60 focus:outline-none focus:ring-1 focus:ring-white/40 backdrop-blur-sm"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg border border-white/30 bg-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50 transition-colors backdrop-blur-sm">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          Not on the team yet?{' '}
          <span className="text-white/70">Talk to your team director.</span>
        </p>

        {IS_DEV && (
          <button type="button" onClick={handleDevLogin}
            className="mt-4 mx-auto block text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2">
            Skip login (dev)
          </button>
        )}
      </div>
    </main>
  )
}
