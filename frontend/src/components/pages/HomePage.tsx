import { Helmet } from 'react-helmet-async'
import { useUsdIdr, useHealthIndex } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner, ErrorState } from '@/components/ui'
import GaugeChart from '@/components/charts/GaugeChart'
import FactorBreakdownChart from '@/components/charts/FactorBreakdownChart'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default function HomePage() {
  const { data: usdData, isLoading: usdLoading, error: usdError } = useUsdIdr()
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthIndex()

  const rate = usdData?.data?.rate
  const change = usdData?.data?.change_24h_pct
  const health = healthData?.data
  const factors = health?.factors || []
  const score = health?.score ?? 50
  const category = health?.category || 'Neutral'

  const seoTitle = `Rupiah ${category === 'Strong' ? 'Menguat' : category === 'Weak' ? 'Melemah' : 'Stabil'} ${rate ? `ke Rp${Number(rate).toLocaleString('id-ID')}/USD` : ''} - Analisis Real-time | Rupiah Pulse`
  const seoDesc = `Pantau kesehatan Rupiah terhadap Dollar AS secara real-time. Indeks kesehatan Rupiah hari ini: ${score}/100.`

  if (usdError || healthError) {
    return <ErrorState message="Gagal memuat data. Silakan coba lagi nanti." />
  }

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <link rel="canonical" href="https://rupiahpulse.com" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ExchangeRateSpecification',
            name: 'USD/IDR Exchange Rate',
            currency: 'IDR',
            currentExchangeRate: { '@type': 'UnitPriceSpecification', price: rate ? Number(rate) : undefined },
            description: 'Real-time Rupiah Health Index and USD/IDR exchange rate analysis',
          })}
        </script>
      </Helmet>

      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Rupiah Pulse</h1>
          <p className="text-lg text-muted-foreground">Indeks Kesehatan Rupiah Real-time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">USD/IDR</CardTitle>
            </CardHeader>
            <CardContent>
              {usdLoading ? <Spinner /> : (
                <>
                  <p className="text-3xl font-bold">{rate ? formatCurrency(Number(rate)) : 'N/A'}</p>
                  {change !== null && change !== undefined && (
                    <Badge variant={change < 0 ? 'success' : 'danger'} className="mt-2">
                      {formatPercent(change)}
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Health Index</CardTitle>
            </CardHeader>
            <CardContent>
              {healthLoading ? <Spinner /> : (
                <>
                  <p className="text-3xl font-bold">{score}</p>
                  <Badge
                    variant={category === 'Strong' ? 'success' : category === 'Neutral' ? 'warning' : 'danger'}
                    className="mt-2"
                  >
                    {category}
                  </Badge>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              {healthLoading ? <Spinner /> : (
                <>
                  <p className="text-lg font-semibold">
                    Rupiah {category === 'Strong' ? 'Menguat' : category === 'Weak' ? 'Melemah' : 'Stabil'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category === 'Strong' ? 'Kondisi positif didukung data makro' :
                     category === 'Weak' ? 'Tekanan dari faktor eksternal dan domestik' :
                     'Pergerakan relatif seimbang'}
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
            <CardHeader>
              <CardTitle>Analisis Pergerakan Rupiah</CardTitle>
            </CardHeader>
            <CardContent>
              <article className="text-lg leading-relaxed">
                {health.explanation}
              </article>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  )
}
