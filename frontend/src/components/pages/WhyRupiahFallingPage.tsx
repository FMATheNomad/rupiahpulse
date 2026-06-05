import { Helmet } from 'react-helmet-async'
import { useHealthIndex } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, Badge, ErrorState } from '@/components/ui'

export default function WhyRupiahFallingPage() {
  const { t } = useLang()
  const { data: healthData, isLoading, error } = useHealthIndex()
  const health = healthData?.data

  if (error) return <ErrorState message={`${t('error.load')} analisis`} />

  return (
    <>
      <Helmet>
        <title>{t('analysis.title')} | Rupiah Pulse</title>
        <link rel="canonical" href="https://rupiahpulse.com/why-rupiah-falling" />
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('analysis.title')}</h1>
          <p className="text-muted-foreground">{t('analysis.subtitle')}</p>
        </div>

        <Card>
          <CardHeader><CardTitle>{t('analysis.explanation')}</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </div>
            ) : (
              <article className="max-w-none">
                <h2 className="text-xl font-semibold mb-4">
                  Rupiah {health?.category === 'Strong' ? t('gauge.strong') : health?.category === 'Weak' ? t('gauge.weak') : t('gauge.neutral')} &mdash; {health?.score}/100
                </h2>
                <p className="text-lg leading-relaxed">{health?.explanation}</p>

                <h3 className="text-lg font-semibold mt-6 mb-3">{t('analysis.detail')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {health?.factors?.map((f: { factor: string; subscore: number; weight: number; contribution: number; raw_value?: number; change_24h_pct?: number }) => (
                    <div key={f.factor} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{f.factor}</h4>
                        <Badge variant={f.subscore >= 70 ? 'success' : f.subscore >= 40 ? 'warning' : 'danger'}>
                          {Math.round(f.subscore)}/100
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('analysis.weight')}: {(f.weight * 100).toFixed(0)}% | {t('analysis.contribution')}: {(f.contribution).toFixed(1)}
                      </p>
                      {f.raw_value !== null && f.raw_value !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          {t('analysis.actual')}: {f.factor === 'DXY' || f.factor === 'Oil' ? f.raw_value.toFixed(2) : f.raw_value.toLocaleString('id-ID')}
                          {f.change_24h_pct !== null && f.change_24h_pct !== undefined && ` (${f.change_24h_pct >= 0 ? '+' : ''}${f.change_24h_pct.toFixed(2)}%)`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3">{t('analysis.methodology')}</h3>
                <p className="text-muted-foreground">{t('analysis.methodology-text')}</p>
              </article>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
