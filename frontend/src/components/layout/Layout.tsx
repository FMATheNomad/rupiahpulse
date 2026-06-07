import { Helmet } from 'react-helmet-async'
import Navbar, { Footer } from './Navbar'
import ErrorBoundary from './ErrorBoundary'
import { useLang } from '@/lib/i18n'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { locale, t } = useLang()
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

        <link rel="preconnect" href="https://query1.finance.yahoo.com" />
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
          <div className="mb-4 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 text-xs text-yellow-800 dark:text-yellow-200 leading-relaxed">
            <strong>{t('banner.hey')}</strong> {t('banner.text')}
          </div>
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
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9.417 15.181l-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.93 2.905c.321-1.496-.541-2.168-1.534-1.79L1.821 10.694c-1.478.565-1.456 1.41-.269 1.777l4.922 1.534 11.415-7.137c.538-.322.695-.161.264.039z"/></svg>
                Telegram
              </a>
              <a
                href="https://trakteer.id/farizma"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-400 hover:bg-green-500 text-green-900 font-semibold text-xs sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                trakteer.id
              </a>
              <a
                href="https://paypal.me/farizmaditya"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg>
                PayPal
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
