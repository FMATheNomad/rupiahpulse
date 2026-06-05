import { Helmet } from 'react-helmet-async'
import { useHealthIndex, useHistory } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner, ErrorState } from '@/components/ui'
import GaugeChart from '@/components/charts/GaugeChart'
import FactorBreakdownChart from '@/components/charts/FactorBreakdownChart'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'

export default function HealthIndexPage() {
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthIndex()
  const { data: historyData, isLoading: historyLoading, error: historyError } = useHistory()

  const health = healthData?.data
  const factors = health?.factors || []
  const score = health?.score ?? 50
  const category = health?.category || 'Neutral'
  const history = historyData?.data || []

  const seoTitle = `Indeks Kesehatan Rupiah: ${score}/100 (${category}) | Rupiah Pulse`

  if (healthError) return <ErrorState message="Gagal memuat data health index" />

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={`Detail Indeks Kesehatan Rupiah hari ini: ${score}/100 - ${category}`} />
        <link rel="canonical" href="https://rupiahpulse.com/health-index" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FinancialProduct',
            name: 'Rupiah Health Index',
            description: 'Composite index measuring Rupiah health against USD',
          })}
        </script>
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Health Index</h1>
          <p className="text-muted-foreground">Indeks Kesehatan Rupiah terhadap USD</p>
        </div>

        {healthLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[280px] rounded-lg border bg-card animate-pulse" />
            <div className="h-[300px] rounded-lg border bg-card animate-pulse" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GaugeChart score={score} loading={false} />
              <FactorBreakdownChart factors={factors} loading={false} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {factors.map((f: { factor: string; subscore: number }) => (
                <Card key={f.factor}>
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground truncate">{f.factor}</p>
                    <p className="text-xl font-bold">{Math.round(f.subscore)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Riwayat Health Index</h2>
          {historyError ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Gagal memuat riwayat data
              </CardContent>
            </Card>
          ) : (
            <TimeSeriesChart
              data={history}
              type="score"
              title="Skor Health Index dari Waktu ke Waktu"
              loading={historyLoading}
              error={!!historyError}
            />
          )}
        </div>
      </section>
    </>
  )
}
