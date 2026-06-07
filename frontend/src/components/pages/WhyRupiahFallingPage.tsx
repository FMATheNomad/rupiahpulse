import { Helmet } from 'react-helmet-async'
import { useHealthIndex } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent, Badge, ErrorState } from '@/components/ui'

export default function WhyRupiahFallingPage() {
  const { t, locale } = useLang()
  const m = (id: string, en: string) => locale === 'en' ? en : id
  const { data: healthData, isLoading, error } = useHealthIndex()
  const health = healthData?.data

  if (error) return <ErrorState message={`${t('error.load')} analisis`} />

  return (
    <>
      <Helmet>
        <title>{`${t('analysis.title')} | Rupiah Pulse`}</title>
        <meta name="description" content="Analisis mendalam penyebab Rupiah melemah atau menguat terhadap Dolar AS. Faktor DXY, harga minyak, inflasi Indonesia, cadangan devisa, neraca perdagangan, dan sentimen pasar." />
        <meta name="keywords" content="kenapa rupiah melemah, penyebab rupiah turun, analisis rupiah, why rupiah falling, rupiah weakening factors" />
        <meta property="og:title" content={`${t('analysis.title')} — Rupiah Pulse`} />
        <meta property="og:description" content="Analisis lengkap faktor-faktor yang mempengaruhi pergerakan Rupiah terhadap Dolar AS." />
        <link rel="canonical" href="https://rupiahpulse.com/why-rupiah-falling" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Analisis Pergerakan Rupiah',
            description: 'Penjelasan lengkap faktor-faktor yang mempengaruhi Rupiah terhadap Dolar AS',
            about: {
              '@type': 'ExchangeRateSpecification',
              currency: 'IDR',
            },
          })}
        </script>
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

                <div className="mt-6 p-4 border rounded-lg bg-muted/30 space-y-4">
                  <p className="text-sm font-semibold">📊 {m('Indikator Pasar Terkait', 'Related Market Indicators')}</p>

                  {health?.market?.ihsg?.value && (
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🇮🇩 IHSG</span>
                        <span className="font-mono font-medium">{Number(health.market.ihsg.value).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                        {health.market.ihsg.change_pct !== null && health.market.ihsg.change_pct !== undefined && (
                          <span className={`text-xs font-medium ${health.market.ihsg.change_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {health.market.ihsg.change_pct >= 0 ? '+' : ''}{health.market.ihsg.change_pct.toFixed(2)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m('IHSG bergerak berlawanan arah dengan USD/IDR — saat Rupiah melemah, biasanya IHSG terkoreksi karena investor asing menarik modal.', 'IHSG moves inversely to USD/IDR — when Rupiah weakens, IHSG typically corrects as foreign investors pull capital.')}
                      </p>
                    </div>
                  )}

                  {health?.market?.us10y?.value && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🏛️ US 10Y Treasury</span>
                        <span className="font-mono font-medium">{health.market.us10y.value.toFixed(2)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m('Yield Treasury AS 10 tahun — acuan global suku bunga. Naiknya yield = tekanan untuk Rupiah.', 'US 10Y Treasury yield — global interest rate benchmark. Rising yield = pressure on Rupiah.')}
                      </p>
                    </div>
                  )}

                  {health?.market?.us3m?.value && (
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">🏦 US 3M T-Bill</span>
                        <span className="font-mono font-medium">{health.market.us3m.value.toFixed(2)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m('Imbal hasil Treasury AS 3 bulan — proksi suku bunga acuan The Fed. Mempengaruhi aliran modal asing ke Indonesia.', 'US 3-month Treasury Bill yield — proxy for Fed rate. Affects foreign capital flows to Indonesia.')}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
