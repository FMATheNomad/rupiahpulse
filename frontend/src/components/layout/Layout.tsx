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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 mb-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-5">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Find bugs, data not accurate, error loading data?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="mailto:fmasoftwarelabs@gmail.com"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-xs sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email
              </a>
              <a
                href="https://t.me/FMATheNomad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-xs sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.24-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
              <a
                href="https://trakteer.id/farizma"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-400 hover:bg-green-500 text-green-900 font-semibold text-xs sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Donate
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
