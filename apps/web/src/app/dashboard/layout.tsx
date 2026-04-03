import Image from 'next/image'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RoleProvider, RoleSwitcher } from '@/components/layout/role-switcher'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Allow dev bypass cookie to skip auth
  const { cookies: cookieStore } = await import('next/headers')
  const devBypass = cookieStore().get('dev_bypass')?.value === '1'

  if (!user && !devBypass) redirect('/sign-in')

  let userName = 'Dev User'
  let userEmail = ''
  let userAvatarUrl: string | undefined = undefined

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, email, avatar_url')
      .eq('id', user.id)
      .single()
    userName     = profile?.name      ?? user.email ?? 'User'
    userEmail    = profile?.email     ?? user.email ?? ''
    userAvatarUrl = profile?.avatar_url ?? user.user_metadata?.['avatar_url'] ?? undefined
  }

  return (
    <RoleProvider>
      <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg-secondary))]">
        <Sidebar userName={userName} userEmail={userEmail} userAvatarUrl={userAvatarUrl} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 sm:px-6">
            <div className="flex items-center gap-3 md:hidden">
              <Image src="/logo.png" alt="A-Team" width={90} height={30} className="object-contain h-8 w-auto" />
            </div>
            <span className="hidden text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-muted))] sm:block">
              {userName}
            </span>
            <div className="ml-auto">
              <RoleSwitcher />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>

        <BottomNav />
      </div>
    </RoleProvider>
  )
}
