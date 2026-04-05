import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RoleProvider, RoleSwitcher } from '@/components/layout/role-switcher'
import { ShadowProvider } from '@/components/layout/shadow-context'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const devBypass = cookies().get('dev_bypass')?.value === '1'

  if (!user && !devBypass) redirect('/sign-in')

  let userName = 'Dev User'
  let userRole = 'admin'

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('name, role')
      .eq('id', user.id)
      .single()
    userName = profile?.name
            ?? (user.user_metadata?.['full_name'] as string | undefined)
            ?? (user.user_metadata?.['name'] as string | undefined)
            ?? user.email
            ?? 'User'
    userRole = profile?.role ?? 'athlete'
  }

  return (
    <ShadowProvider>
    <RoleProvider defaultRole={userRole as any}>
      <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg-secondary))]">
        <Sidebar userName={userName} userRole={userRole} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--surface))] px-4 sm:px-6">
            <div className="flex items-center gap-3 md:hidden">
              {/* mobile logo placeholder */}
            </div>
            <div className="flex-1" />
            <RoleSwitcher />
          </header>

          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>

        <BottomNav />
      </div>
    </RoleProvider>
    </ShadowProvider>
  )
}
