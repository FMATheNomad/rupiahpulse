import { Helmet } from 'react-helmet-async'
import { usePrediction, useUsdIdr } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner, Skeleton, ErrorState } from '@/components/ui'

export default function PredictionPage() {
  const { t } = useLang()
  const { data: predData, isLoading, error } = usePrediction()
  const { data: usdData } = useUsdIdr()

  const p = predData?.data
  const latestRate = p?.latest_rate || usdData?.data?.rate

  if (error) return <ErrorState message={`${t('error.load')} prediksi`} />

  const periods = [
    { key: '1m', label: t('prediction.1m') },
    { key: '3m', label: t('prediction.3m') },
    { key: '6m', label: t('prediction.6m') },
    { key: '1y', label: t('prediction.1y') },
  ]

  return (
    <>
      <Helmet>
        <title>{`${t('prediction.title')} | Rupiah Pulse`}</title>
        <link rel="canonical" href="https://rupiahpulse.com/prediction" />
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('prediction.title')}</h1>
          <p className="text-muted-foreground">{t('prediction.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : !p ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{t('empty.no-data')}</CardContent></Card>
        ) : (
          <>
            <Card>
              <CardHeader><CardTitle>{t('prediction.projection')}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {periods.map(({ key, label }) => {
                    const data = p.predictions?.[key]
                    if (!data) return null
                    return (
                      <Card key={key}>
                        <CardContent className="p-4 text-center">
                          <p className="text-xs text-muted-foreground uppercase font-semibold">{label}</p>
                          <p className="text-2xl font-bold mt-1">Rp {Number(data.predicted).toLocaleString('id-ID')}</p>
                          <p className={`text-sm font-medium ${data.change > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                            {data.change > 0 ? '+' : ''}{data.change_pct}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Rp {Number(data.lower).toLocaleString('id-ID')} &ndash; Rp {Number(data.upper).toLocaleString('id-ID')}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">{t('prediction.current-trend')}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">
                    {p.trend?.direction === 'melemah' ? t('gauge.weak') : t('gauge.strong')} {Math.abs(p.trend?.daily_change || 0).toFixed(0)}/hari
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{t('prediction.accuracy')}: {p.trend?.r_squared}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">{t('prediction.market-sentiment')}</CardTitle></CardHeader>
                <CardContent>
                  <Badge variant={
                    p.sentiment?.consensus === 'bullish' ? 'success' :
                    p.sentiment?.consensus === 'bearish' ? 'danger' : 'warning'
                  }>
                    {p.sentiment?.consensus === 'bullish' ? t('sentiment.bullish-label') :
                     p.sentiment?.consensus === 'bearish' ? t('sentiment.bearish-label') : t('sentiment.neutral-label')}
                  </Badge>
                  <p className="text-sm mt-2">{p.sentiment?.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-sm">{t('prediction.current-rate')}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Rp {Number(latestRate).toLocaleString('id-ID')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('prediction.volatility')}: &plusmn;Rp {Number(p.trend?.volatility || 0).toLocaleString('id-ID')}</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>
    </>
  )
}
