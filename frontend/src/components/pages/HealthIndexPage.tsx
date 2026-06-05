import { Helmet } from 'react-helmet-async'
import { useHealthIndex, useHistory } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, ErrorState } from '@/components/ui'
import GaugeChart from '@/components/charts/GaugeChart'
import FactorBreakdownChart from '@/components/charts/FactorBreakdownChart'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'

export default function HealthIndexPage() {
  const { t } = useLang()
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthIndex()
  const { data: historyData, isLoading: historyLoading, error: historyError } = useHistory()

  const health = healthData?.data
  const factors = health?.factors || []
  const score = health?.score ?? 50
  const category = health?.category || 'Neutral'
  const history = historyData?.data || []

  if (healthError) return <ErrorState message={`${t('error.load')} Health Index`} />

  return (
    <>
      <Helmet>
        <title>{`${t('health.title')}: ${score}/100 (${category || 'Neutral'}) | Rupiah Pulse`}</title>
        <link rel="canonical" href="https://rupiahpulse.com/health-index" />
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('health.title')}</h1>
          <p className="text-muted-foreground">{t('health.subtitle')}</p>
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
          <h2 className="text-xl font-semibold mb-4">{t('health.history')}</h2>
          <TimeSeriesChart
            data={history}
            type="score"
            title={t('health.score-label')}
            loading={historyLoading}
            error={!!historyError}
          />
        </div>
      </section>
    </>
  )
}
