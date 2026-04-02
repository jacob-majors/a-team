'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './provider'
import { cn } from '@a-team/utils'

const OPTIONS = [
  { value: 'light',  label: 'Light',  icon: Sun },
  { value: 'dark',   label: 'Dark',   icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()

  if (compact) {
    // Simple single-button toggle for mobile
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="rounded-md p-1.5 text-[rgb(var(--text-muted))] hover:bg-[rgb(var(--bg-secondary))]"
        title="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-[rgb(var(--bg-secondary))] p-0.5">
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors',
            theme === value
              ? 'bg-[rgb(var(--surface))] text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
