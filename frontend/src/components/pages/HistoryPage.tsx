import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useUsdIdrHistory, useHistory } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, ErrorState } from '@/components/ui'
import TimeSeriesChart from '@/components/charts/TimeSeriesChart'
import TimeRangeSelector from '@/components/charts/TimeRangeSelector'

export default function HistoryPage() {
  const { t } = useLang()
  const [range, setRange] = useState('1y')

  const { data: usdData, isLoading: usdLoading, error: usdError } = useUsdIdrHistory(range)
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHistory(range)

  const usdHistory = usdData?.data || []
  const healthHistory = healthData?.data || []

  if (usdError && healthError) return <ErrorState message={t('error.load')} />

  return (
    <>
      <Helmet>
        <title>{`${t('history.title')} | Rupiah Pulse`}</title>
        <link rel="canonical" href="https://rupiahpulse.com/history" />
      </Helmet>

      <section className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('history.title')}</h1>
            <p className="text-muted-foreground">{t('history.subtitle')}</p>
          </div>
          <TimeRangeSelector value={range} onChange={setRange} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t('history.usd-idr')}</h2>
          </div>
          <TimeSeriesChart data={usdHistory} type="rate" title={false} loading={usdLoading} error={!!usdError} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">{t('history.health-index')}</h2>
          </div>
          <TimeSeriesChart data={healthHistory} type="score" title={false} loading={healthLoading} error={!!healthError} />
        </div>

        <Card>
          <CardHeader><CardTitle>{t('history.table-title')}</CardTitle></CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}</div>
            ) : healthHistory.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">{t('history.table-title')} {t('empty.no-data')}</div>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 sticky top-0 bg-background">{t('history.table-date')}</th>
                      <th className="text-right py-2 px-3 sticky top-0 bg-background">{t('history.table-score')}</th>
                      <th className="text-right py-2 px-3 sticky top-0 bg-background">{t('history.table-category')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthHistory.map((item: { timestamp_bucket: string; score: number; category: string }) => (
                      <tr key={item.timestamp_bucket} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3">{new Date(item.timestamp_bucket).toLocaleDateString()}</td>
                        <td className="text-right py-2 px-3 font-medium">{item.score}</td>
                        <td className="text-right py-2 px-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            item.category === 'Strong' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                            item.category === 'Weak' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                            'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                          }`}>{item.category}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
