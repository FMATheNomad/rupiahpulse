import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useLang } from '@/lib/i18n'
import { ThemeToggle, LangToggle } from './ToggleBar'

const navItems = [
  { path: '/', labelKey: 'nav.beranda' },
  { path: '/health-index', labelKey: 'nav.health-index' },
  { path: '/prediction', labelKey: 'nav.prediksi' },
  { path: '/history', labelKey: 'nav.riwayat' },
  { path: '/why-rupiah-falling', labelKey: 'nav.analisis' },
  { path: '/news', labelKey: 'nav.berita' },
]

export default function Navbar() {
  const location = useLocation()
  const { t } = useLang()

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
          </div>
        </div>
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
          <span className="text-red-500 font-bold">with excessive anger towards the Indonesian government</span>
        </p>
      </div>
    </footer>
  )
}
