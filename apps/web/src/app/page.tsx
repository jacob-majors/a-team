import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default function HomePage() {
  const { userId } = auth()
  if (userId) redirect('/dashboard')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-700 px-4">
      <div className="text-center text-white">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl backdrop-blur-sm">
            🚵
          </div>
        </div>
        <h1 className="mb-2 text-5xl font-bold tracking-tight">A-Team</h1>
        <p className="mb-8 text-xl text-orange-100">Annadel Composite MTB</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-in"
            className="rounded-xl bg-white px-8 py-3 font-semibold text-orange-600 shadow-lg transition hover:bg-orange-50"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-xl border-2 border-white/60 px-8 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Join Team
          </Link>
        </div>
      </div>
    </main>
  )
}
