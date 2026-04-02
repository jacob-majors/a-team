import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { TRPCProvider } from '@/lib/trpc/provider'
import { ThemeProvider } from '@/components/theme/provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'A-Team | Annadel Composite MTB',
  description: 'Team management for Annadel Composite youth mountain bike team',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

// Inline script prevents flash of wrong theme before React hydrates
const themeScript = `
  (function() {
    try {
      var t = localStorage.getItem('theme') || 'system';
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (t === 'dark' || (t === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
