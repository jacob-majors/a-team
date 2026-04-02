import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { TRPCProvider } from '@/lib/trpc/provider'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  return (
    <TRPCProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop sidebar */}
        <Sidebar
          userName={user?.fullName ?? user?.emailAddresses[0]?.emailAddress ?? 'User'}
          userAvatar={user?.imageUrl}
          userEmail={user?.emailAddresses[0]?.emailAddress ?? ''}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </TRPCProvider>
  )
}
