import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Beranda' },
  { path: '/health-index', label: 'Health Index' },
  { path: '/prediction', label: 'Prediksi' },
  { path: '/history', label: 'Riwayat' },
  { path: '/why-rupiah-falling', label: 'Analisis' },
  { path: '/news', label: 'Berita' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Rupiah Pulse</span>
          </Link>
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="border-t mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>Rupiah Pulse &copy; {new Date().getFullYear()} &mdash; Indeks Kesehatan Rupiah Real-time</p>
        <p className="mt-1">Data diperbarui setiap 5 menit. Sumber: open.er-api.com, Yahoo Finance, Stooq, World Bank, GDELT.</p>
      </div>
    </footer>
  )
}
