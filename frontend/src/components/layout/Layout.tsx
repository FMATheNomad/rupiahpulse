import { Helmet } from 'react-helmet-async'
import Navbar, { Footer } from './Navbar'
import ErrorBoundary from './ErrorBoundary'
import { useLang } from '@/lib/i18n'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { locale } = useLang()
  const url = typeof window !== 'undefined' ? window.location.href : 'https://rupiahpulse.com'
  const domain = 'rupiahpulse.com'

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <html lang={locale === 'en' ? 'en' : 'id'} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />

        <link rel="canonical" href={url} />
        <link rel="alternate" href={url} hrefLang={locale === 'en' ? 'en' : 'id'} />
        <link rel="alternate" href={url} hrefLang="x-default" />

        <meta property="og:site_name" content="Rupiah Pulse" />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'id_ID'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@rupiahpulse" />
        <meta name="twitter:domain" content={domain} />

        <link rel="preconnect" href="https://open.er-api.com" />
        <link rel="preconnect" href="https://query1.finance.yahoo.com" />
        <link rel="dns-prefetch" href="https://open.er-api.com" />
        <link rel="dns-prefetch" href="https://query1.finance.yahoo.com" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Rupiah Pulse',
            url: 'https://rupiahpulse.com',
            description: 'Real-time Rupiah Health Index. Monitor, analyze & predict USD/IDR exchange rates with live data.',
            inLanguage: locale === 'en' ? 'en' : 'id',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://rupiahpulse.com/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          })}
        </script>
      </Helmet>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
