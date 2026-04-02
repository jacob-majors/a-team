import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { RoleProvider, RoleSwitcher } from '@/components/layout/role-switcher'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop sidebar */}
        <Sidebar userName="Demo User" userEmail="demo@annadel.org" />

        {/* Right side */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar with role switcher */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide hidden sm:block">
              Preview Mode
            </span>
            <div className="ml-auto">
              <RoleSwitcher />
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </RoleProvider>
  )
}
