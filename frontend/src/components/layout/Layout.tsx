import { Helmet } from 'react-helmet-async'
import Navbar, { Footer } from './Navbar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <html lang="id" />
        <meta charSet="utf-8" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      <Footer />
    </div>
  )
}
