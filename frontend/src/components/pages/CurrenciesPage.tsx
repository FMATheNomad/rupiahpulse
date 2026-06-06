import { Helmet } from 'react-helmet-async'
import { useCurrencies } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from '@/components/ui'

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭',
  AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿', SGD: '🇸🇬', MYR: '🇲🇾',
  CNY: '🇨🇳', HKD: '🇭🇰', KRW: '🇰🇷', THB: '🇹🇭', PHP: '🇵🇭',
  VND: '🇻🇳', INR: '🇮🇳', TWD: '🇹🇼', SAR: '🇸🇦', AED: '🇦🇪',
  QAR: '🇶🇦', KWD: '🇰🇼', SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰',
  TRY: '🇹🇷', BRL: '🇧🇷', MXN: '🇲🇽', ZAR: '🇿🇦', RUB: '🇷🇺',
}

export default function CurrenciesPage() {
  const { t } = useLang()
  const { data, isLoading, error } = useCurrencies()
  const rates = data?.data || []

  if (error) return <ErrorState message={`${t('error.load')} currencies`} />

  return (
    <>
      <Helmet>
        <title>Currency Rates | Rupiah Pulse</title>
        <link rel="canonical" href="https://rupiahpulse.com/currencies" />
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Currency Rates</h1>
          <p className="text-muted-foreground">Live exchange rates against Indonesian Rupiah (IDR)</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(9)].map((_, i) => (
              <Card key={i}><CardContent className="p-5"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
            ))}
          </div>
        ) : rates.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{t('empty.no-data')}</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rates.map((item: { pair: string; rate: number; change_pct: number | null }) => {
              const base = item.pair.split('/')[0]
              const flag = CURRENCY_FLAGS[base] || ''
              const change = item.change_pct
              return (
                <Card key={item.pair}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{flag}</span>
                      <span className="text-xs font-medium text-muted-foreground">{item.pair}</span>
                    </div>
                    <p className="text-xl font-bold">{item.rate.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    {change !== null && change !== undefined && (
                      <p className={`text-sm font-medium mt-1 ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
