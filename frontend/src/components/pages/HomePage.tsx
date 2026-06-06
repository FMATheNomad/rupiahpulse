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

  const desc = `USD/IDR hari ini Rp ${Number(rate || 18000).toLocaleString('id-ID')} — Health Index ${score}/100 (${category}). Pantau kesehatan Rupiah secara real-time. Analisis DXY, inflasi, minyak, dan sentimen pasar.`
  const keywords = 'rupiah, usd idr, kurs rupiah, dollar rupiah, rupiah melemah, rupiah menguat, indonesia exchange rate, nilai tukar rupiah, kesehatan rupiah'

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={desc} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={desc} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={desc} />
        <link rel="canonical" href="https://rupiahpulse.com" />

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ExchangeRateSpecification',
            name: 'USD/IDR Exchange Rate',
            description: 'Real-time USD to IDR exchange rate and Rupiah Health Index',
            currency: 'IDR',
            currentExchangeRate: {
              '@type': 'UnitPriceSpecification',
              price: Number(rate || 18037),
              currency: 'IDR',
            },
            additionalType: 'https://schema.org/FinancialProduct',
          })}
        </script>

        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Mengapa Rupiah melemah hari ini?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: health?.explanation ? health.explanation.substring(0, 200) : 'Rupiah dipengaruhi oleh DXY, harga minyak, inflasi, dan sentimen pasar global.',
                },
              },
              {
                '@type': 'Question',
                name: 'Berapa kurs USD/IDR hari ini?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `Kurs USD/IDR hari ini berada di Rp ${Number(rate || 18037).toLocaleString('id-ID')} per 1 Dolar AS.`,
                },
              },
              {
                '@type': 'Question',
                name: 'Apa itu Rupiah Health Index?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Indeks yang mengukur kesehatan Rupiah terhadap Dolar AS berdasarkan 7 faktor: DXY, Oil, Inflasi, Cadangan Devisa, Neraca Perdagangan, Sentimen Pasar, dan Nilai Tukar USD/IDR.',
                },
              },
              {
                '@type': 'Question',
                name: 'Apakah Rupiah akan menguat?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Berdasarkan analisis fundamental, pergerakan Rupiah dipengaruhi oleh kebijakan The Fed, harga komoditas, dan fundamental ekonomi Indonesia. Cek halaman Prediksi untuk proyeksi terkini.',
                },
              },
            ],
          })}
        </script>
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

        {score > 0 && rate && (
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <CardHeader><CardTitle className="text-base">
              {rate > 17000 ? '⚠️ Dampak Pelemahan Rupiah untuk Anda' : '📈 Dampak Penguatan Rupiah untuk Anda'}
            </CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {rate > 17000 ? (
                  <>
                    <li className="flex items-start gap-2">• <span><strong>Harga barang impor naik</strong> — elektronik, obat, bahan baku industri tambah mahal</span></li>
                    <li className="flex items-start gap-2">• <span><strong>Biaya pendidikan & wisata luar negeri</strong> — makin mahal karena dolar naik</span></li>
                    <li className="flex items-start gap-2">• <span><strong>Inflasi tertahan</strong> — harga barang dalam negeri ikut tertekan naik</span></li>
                    <li className="flex items-start gap-2">• <span><strong>Positif: eksportir diuntungkan</strong> — hasil jualannya lebih bernilai</span></li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2">• <span><strong>Daya beli masyarakat terjaga</strong> — harga barang impor lebih murah</span></li>
                    <li className="flex items-start gap-2">• <span><strong>Biaya luar negeri lebih murah</strong> — liburan, kuliah, atau bisnis ke luar negeri</span></li>
                    <li className="flex items-start gap-2">• <span><strong>Inflasi lebih terkendali</strong></span></li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  )
}
