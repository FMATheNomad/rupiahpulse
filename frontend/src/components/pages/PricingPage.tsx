import { Helmet } from 'react-helmet-async'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

const PLANS = [
  {
    name: 'Free',
    price: 'Rp 0',
    requests: '100/hari',
    features: [
      'USD/IDR rate',
      'Health Index',
      'Basic rate limiting',
      'Community support',
    ],
    polarUrl: null,
    popular: false,
  },
  {
    name: 'Starter',
    price: '$5',
    period: '/bulan',
    requests: '1.000/hari',
    features: [
      'Semua data pairs (9 mata uang)',
      'Health Index + faktor',
      'News + sentimen',
      'Prediksi 1-3 bulan',
      'Prioritas support',
    ],
    polarUrl: 'https://polar.sh/checkout/starter',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/bulan',
    requests: '10.000/hari',
    features: [
      'Semua fitur Starter',
      'Prediksi full (s/d 1 tahun)',
      'History data (CSV export)',
      'API key management',
      'Dedicated support',
    ],
    polarUrl: 'https://polar.sh/checkout/pro',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: '/bulan',
    requests: '100.000/hari',
    features: [
      'Semua fitur Pro',
      'Widget embed untuk website',
      'White-label option',
      'SLA guarantee',
      'Custom integration',
    ],
    polarUrl: 'https://polar.sh/checkout/enterprise',
    popular: false,
  },
]

export default function PricingPage() {
  const { t, locale } = useLang()
  const isEn = locale === 'en'

  return (
    <>
      <Helmet>
        <title>{isEn ? 'Pricing' : 'Harga'} | Rupiah Pulse</title>
        <link rel="canonical" href="https://rupiahpulse.com/pricing" />
      </Helmet>

      <section className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            {isEn ? 'API Pricing' : 'Harga API'}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            {isEn
              ? 'Access real-time Rupiah data, Health Index, and economic indicators via simple REST API.'
              : 'Akses data Rupiah real-time, Health Index, dan indikator ekonomi via REST API yang sederhana.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  {isEn ? 'Most Popular' : 'Terpopuler'}
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{plan.requests}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.polarUrl ? (
                  <a
                    href={plan.polarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-6 block w-full text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'bg-muted text-foreground hover:bg-accent'
                    }`}
                  >
                    {isEn ? 'Subscribe via Polar.sh' : 'Langganan via Polar.sh'}
                  </a>
                ) : (
                  <div className="mt-6 block w-full text-center py-2.5 rounded-lg bg-muted text-muted-foreground text-sm">
                    {isEn ? 'Free — No signup needed' : 'Gratis — Tanpa daftar'}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/30">
          <CardContent className="p-6 text-sm space-y-3">
            <p className="font-semibold">{isEn ? 'API Documentation' : 'Dokumentasi API'}</p>
            <code className="block bg-background p-3 rounded text-xs font-mono">
              GET /api/v1/usd-idr?api_key=your_key<br />
              GET /api/v1/health-index?api_key=your_key<br />
              GET /api/v1/currencies?api_key=your_key<br />
              GET /api/v1/currencies/history?pair=SGD/IDR&api_key=your_key<br />
              GET /api/v1/news?limit=10&api_key=your_key
            </code>
            <p className="text-muted-foreground">
              {isEn
                ? 'All endpoints return standard envelope: { "data": {}, "meta": {} }'
                : 'Semua endpoint mengembalikan envelope standar: { "data": {}, "meta": {} }'}
            </p>
            <p className="text-muted-foreground text-xs">
              * {isEn ? 'Payments processed via Polar.sh. Stripe/PayPal supported.' : 'Pembayaran diproses via Polar.sh. Stripe/PayPal didukung.'}
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
