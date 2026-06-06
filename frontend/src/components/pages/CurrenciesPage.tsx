import ReactEChartsCore from 'echarts-for-react'
import { Helmet } from 'react-helmet-async'
import { useCurrencies, useCurrencyHistory } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, Spinner, ErrorState } from '@/components/ui'

const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺',
  SGD: '🇸🇬', MYR: '🇲🇾', CNY: '🇨🇳', THB: '🇹🇭',
}

function Sparkline({ pair }: { pair: string }) {
  const { data, isLoading } = useCurrencyHistory(pair, 30)
  const history = data?.data || []
  if (isLoading || history.length < 2) return null
  const rates = [...history].reverse().map((h: any) => h.rate)
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const range = max - min || 1
  const isUp = rates[rates.length - 1] >= rates[0]
  const option = {
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { show: false },
    yAxis: { show: false, min, max },
    series: [{
      type: 'line', data: rates, smooth: true, showSymbol: false,
      lineStyle: { color: isUp ? '#dc2626' : '#16a34a', width: 1.5 },
      areaStyle: { color: isUp ? 'rgba(220,38,38,0.08)' : 'rgba(22,163,74,0.08)' },
    }],
  }
  return <ReactEChartsCore option={option} style={{ height: 48 }} lazyUpdate />
}

function CurrencyCard({ pair, rate, change_pct }: { pair: string; rate: number; change_pct: number | null }) {
  const base = pair.split('/')[0]
  const flag = CURRENCY_FLAGS[base] || ''
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{flag}</span>
            <span className="text-sm font-medium text-muted-foreground">{pair}</span>
          </div>
        </div>
        <p className="text-xl font-bold">
          {rate.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
        {change_pct !== null && change_pct !== undefined && (
          <p className={`text-sm font-medium ${change_pct >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {change_pct >= 0 ? '+' : ''}{change_pct.toFixed(2)}%
          </p>
        )}
        <div className="mt-2 opacity-60">
          <Sparkline pair={pair} />
        </div>
      </CardContent>
    </Card>
  )
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Currency Rates</h1>
            <p className="text-muted-foreground">Live exchange rates against Indonesian Rupiah (IDR)</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(9)].map((_, i) => (
              <Card key={i}><CardContent className="p-5"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent></Card>
            ))}
          </div>
        ) : rates.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{t('empty.no-data')}</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rates.map((item: { pair: string; rate: number; change_pct: number | null }) => (
              <CurrencyCard key={item.pair} pair={item.pair} rate={item.rate} change_pct={item.change_pct} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
