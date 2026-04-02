import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RoleProvider, RoleSwitcher } from '@/components/layout/role-switcher'

// Lazy import Clerk only when available — avoids crashing when keys are missing
async function getClerkUser() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  if (!key?.startsWith('pk_')) return null
  try {
    const { currentUser } = await import('@clerk/nextjs/server')
    return await currentUser()
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getClerkUser()

  const userName = user?.fullName
    ?? user?.emailAddresses[0]?.emailAddress
    ?? 'Demo User'
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? ''

  return (
    <RoleProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar userName={userName} userEmail={userEmail} userImageUrl={user?.imageUrl} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <span className="hidden text-xs font-medium uppercase tracking-wide text-gray-400 sm:block">
              {user ? userName : 'Preview Mode'}
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
