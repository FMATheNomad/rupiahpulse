import { Helmet } from 'react-helmet-async'
import { useUsdIdr, useHealthIndex } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner, ErrorState } from '@/components/ui'
import GaugeChart from '@/components/charts/GaugeChart'
import FactorBreakdownChart from '@/components/charts/FactorBreakdownChart'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default function HomePage() {
  const { t } = useLang()
  const { data: usdData, isLoading: usdLoading, error: usdError } = useUsdIdr()
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthIndex()

  const rate = usdData?.data?.rate
  const change = usdData?.data?.change_24h_pct
  const health = healthData?.data
  const factors = health?.factors || []
  const score = health?.score ?? 50
  const category = health?.category || 'Neutral'

  const catLabel = category === 'Strong' ? 'Strong' : category === 'Weak' ? 'Weak' : 'Neutral'

  const rateStr = rate ? `Rp${Number(rate).toLocaleString('id-ID')}/USD` : '-'
  const seoKey = category === 'Strong' ? 'seo.title.strong' : category === 'Weak' ? 'seo.title.weak' : 'seo.title.neutral'
  const seoTitle = t(seoKey, { rate: rateStr })

  if (usdError || healthError) {
    return <ErrorState message={`${t('error.load')}. ${t('error.generic')}`} />
  }

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <link rel="canonical" href="https://rupiahpulse.com" />
      </Helmet>

      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t('nav.rupiah-pulse')}</h1>
          <p className="text-lg text-muted-foreground">{t('home.title')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{t('home.usd-idr')}</CardTitle></CardHeader>
            <CardContent>
              {usdLoading ? <Spinner /> : (
                <>
                  <p className="text-3xl font-bold">{rate ? formatCurrency(Number(rate)) : 'N/A'}</p>
                  {change !== null && change !== undefined && (
                    <Badge variant={change < 0 ? 'success' : 'danger'} className="mt-2">{formatPercent(change)}</Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{t('home.health-index')}</CardTitle></CardHeader>
            <CardContent>
              {healthLoading ? <Spinner /> : (
                <>
                  <p className="text-3xl font-bold">{score}</p>
                  <Badge variant={category === 'Strong' ? 'success' : category === 'Neutral' ? 'warning' : 'danger'} className="mt-2">
                    {catLabel}
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm text-muted-foreground">{t('home.status')}</CardTitle></CardHeader>
            <CardContent>
              {healthLoading ? <Spinner /> : (
                <>
                  <p className="text-lg font-semibold">
                    Rupiah {catLabel}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GaugeChart score={score} loading={healthLoading} />
          <FactorBreakdownChart factors={factors} loading={healthLoading} />
        </div>

        {health?.explanation && (
          <Card>
            <CardHeader><CardTitle>{t('home.analysis')}</CardTitle></CardHeader>
            <CardContent>
              <article className="text-lg leading-relaxed">{health.explanation}</article>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  )
}
