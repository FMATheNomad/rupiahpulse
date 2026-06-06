import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLang } from '@/lib/i18n'
import { ThemeToggle, LangToggle } from './ToggleBar'

const navItems = [
  { path: '/', labelKey: 'nav.beranda' },
  { path: '/health-index', labelKey: 'nav.health-index' },
  { path: '/prediction', labelKey: 'nav.prediksi' },
  { path: '/currencies', labelKey: 'nav.currencies' },
  { path: '/history', labelKey: 'nav.riwayat' },
  { path: '/why-rupiah-falling', labelKey: 'nav.analisis' },
  { path: '/news', labelKey: 'nav.berita' },
]

export default function Navbar() {
  const location = useLocation()
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <span className="text-xl font-bold text-primary">{t('nav.rupiah-pulse')}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LangToggle />
            <ThemeToggle />
            <div className="md:hidden flex gap-0.5 bg-muted rounded-lg p-0.5">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t pb-4 pt-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

export function Footer() {
  const { t } = useLang()
  return (
    <footer className="border-t mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Rupiah Pulse &copy; {new Date().getFullYear()} &mdash; {t('nav.health-index')}</p>
        <p className="mt-1">{t('footer.data-sources')}</p>
        <p className="mt-3 text-xs">
          Built and developed by{' '}
          <a href="https://fmasoftwarelabs.up.railway.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            FMA Software Labs
          </a>{' '}
          <span className="text-muted-foreground">Built with ❤️ for Indonesian financial literacy</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
          {' · '}
          <a href="https://polar.sh/rupiahpulse" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">API Access</a>
          {' · '}
          <Link to="/news" className="hover:text-foreground transition-colors">News</Link>
          {' · '}
          <Link to="/history" className="hover:text-foreground transition-colors">History</Link>
          {' · '}
          <Link to="/currencies" className="hover:text-foreground transition-colors">Currencies</Link>
        </p>
      </div>
    </footer>
  )
}
