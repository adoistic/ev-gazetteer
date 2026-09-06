'use client'

import { useEffect, useState } from 'react'

type Theme = 'system' | 'light' | 'dark'
const ORDER: Theme[] = ['system', 'light', 'dark']
const LABEL: Record<Theme, string> = { system: 'Auto', light: 'Light', dark: 'Dark' }

/**
 * Three states, cycled by one button, because the masthead has no room for a
 * segmented control on a phone. "Auto" follows the operating system; the other
 * two override it. The choice is written to localStorage and read back by the
 * inline script in the document head, which runs before first paint.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored && ORDER.includes(stored)) setTheme(stored)
    setMounted(true)
  }, [])

  const apply = (next: Theme) => {
    setTheme(next)
    try {
      if (next === 'system') {
        localStorage.removeItem('theme')
        document.documentElement.removeAttribute('data-theme')
      } else {
        localStorage.setItem('theme', next)
        document.documentElement.setAttribute('data-theme', next)
      }
    } catch {
      // Private browsing can refuse storage; the attribute still applies.
    }
  }

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]

  return (
    <button
      type="button"
      className="theme"
      onClick={() => apply(next)}
      // Before mount the stored value is unknown, so the label would flicker.
      aria-label={mounted ? `Colour theme: ${LABEL[theme]}. Switch to ${LABEL[next]}.` : 'Colour theme'}
      title={mounted ? `Theme: ${LABEL[theme]}` : undefined}
    >
      <Glyph theme={theme} />
      <span>{mounted ? LABEL[theme] : ''}</span>
    </button>
  )
}

/** Two inks, so the mark is drawn rather than coloured. */
function Glyph({ theme }: { theme: Theme }) {
  if (theme === 'light') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="8" cy="8" r="3.2" />
        <path d="M8 .8v2.2M8 13v2.2M.8 8h2.2M13 8h2.2M2.9 2.9l1.6 1.6M11.5 11.5l1.6 1.6M13.1 2.9l-1.6 1.6M4.5 11.5l-1.6 1.6" />
      </svg>
    )
  }
  if (theme === 'dark') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
        <path d="M13.4 10.3A6 6 0 0 1 5.7 2.6a6 6 0 1 0 7.7 7.7z" />
      </svg>
    )
  }
  // Auto: half filled, so the state is legible without colour.
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 1.8a6.2 6.2 0 0 1 0 12.4z" fill="currentColor" />
    </svg>
  )
}
