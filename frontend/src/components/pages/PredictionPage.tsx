import { Helmet } from 'react-helmet-async'
import { usePrediction, useUsdIdr } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner, Skeleton, ErrorState } from '@/components/ui'

export default function PredictionPage() {
  const { data: predData, isLoading, error } = usePrediction()
  const { data: usdData } = useUsdIdr()

  const p = predData?.data
  const latestRate = p?.latest_rate || usdData?.data?.rate

  if (error) return <ErrorState message="Gagal memuat data prediksi" />

  return (
    <>
      <Helmet>
        <title>Prediksi Rupiah | Rupiah Pulse</title>
        <meta name="description" content="Prediksi pergerakan Rupiah berdasarkan tren historis, analisis teknis, dan sentimen pasar." />
        <link rel="canonical" href="https://rupiahpulse.com/prediction" />
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prediksi Rupiah</h1>
          <p className="text-muted-foreground">Proyeksi pergerakan USD/IDR berdasarkan tren historis dan sentimen pasar</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : !p ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Data prediksi belum tersedia
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Proyeksi USD/IDR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(p.predictions || {}).map(([period, data]: [string, any]) => (
                    <Card key={period}>
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase font-semibold">
                          {period === '1m' ? '1 Bulan' : period === '3m' ? '3 Bulan' : period === '6m' ? '6 Bulan' : '1 Tahun'}
                        </p>
                        <p className="text-2xl font-bold mt-1">Rp {Number(data.predicted).toLocaleString('id-ID')}</p>
                        <p className={`text-sm font-medium ${data.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {data.change > 0 ? '+' : ''}{data.change_pct}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rp {Number(data.lower).toLocaleString('id-ID')} - Rp {Number(data.upper).toLocaleString('id-ID')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tren Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">
                    {p.trend?.direction === 'melemah' ? 'Melemah' : 'Menguat'} {p.trend?.daily_change?.toFixed(0)}/hari
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Akurasi model: {p.trend?.r_squared}%
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Sentimen Pasar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={
                    p.sentiment?.consensus === 'bullish' ? 'success' :
                    p.sentiment?.consensus === 'bearish' ? 'danger' : 'warning'
                  }>
                    {p.sentiment?.consensus === 'bullish' ? 'Bullish' :
                     p.sentiment?.consensus === 'bearish' ? 'Bearish' : 'Netral'}
                  </Badge>
                  <p className="text-sm mt-2">{p.sentiment?.summary}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Nilai Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">Rp {Number(latestRate).toLocaleString('id-ID')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Volatilitas: ±Rp {p.trend?.volatility?.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </section>
    </>
  )
}
