import { useState } from 'react'
import { SunIcon, MoonIcon } from './Icons.jsx'
import { trackEvent } from '../lib/analytics.js'

// Toggles between light and dark themes via a [data-theme] attribute on <html>,
// persisting the choice in localStorage.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'dark',
  )

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    trackEvent('toggle_theme', { menu: next === 'dark' ? 'Dark mode' : 'Light mode' })
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch { /* ignore */ }
    setTheme(next)
  }

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label="Toggle light / dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
