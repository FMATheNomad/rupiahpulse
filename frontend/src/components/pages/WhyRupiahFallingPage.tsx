import { Helmet } from 'react-helmet-async'
import { useHealthIndex } from '@/hooks/useApi'
import { Card, CardHeader, CardTitle, CardContent, Badge, ErrorState } from '@/components/ui'

export default function WhyRupiahFallingPage() {
  const { data: healthData, isLoading, error } = useHealthIndex()
  const health = healthData?.data

  if (error) return <ErrorState message="Gagal memuat data analisis" />

  return (
    <>
      <Helmet>
        <title>Analisis: Kenapa Rupiah Melemah/Menguat? | Rupiah Pulse</title>
        <meta name="description" content="Analisis mendalam penyebab pergerakan Rupiah terhadap USD. Faktor DXY, minyak, inflasi, cadangan devisa, neraca perdagangan, dan sentimen pasar." />
        <link rel="canonical" href="https://rupiahpulse.com/why-rupiah-falling" />
      </Helmet>

      <section className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analisis Pergerakan Rupiah</h1>
          <p className="text-muted-foreground">Penjelasan lengkap faktor-faktor yang mempengaruhi Rupiah</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Penjelasan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              </div>
            ) : (
              <article className="max-w-none">
                <h2 className="text-xl font-semibold mb-4">
                  Rupiah {health?.category === 'Strong' ? 'Menguat' : health?.category === 'Weak' ? 'Melemah' : 'Stabil'}
                  {' '}dengan Skor {health?.score}/100
                </h2>
                <p className="text-lg leading-relaxed">{health?.explanation}</p>

                <h3 className="text-lg font-semibold mt-6 mb-3">Detail Faktor</h3>
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
                        Bobot: {(f.weight * 100).toFixed(0)}% | Kontribusi: {(f.contribution).toFixed(1)}
                      </p>
                      {f.raw_value !== null && f.raw_value !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          Nilai: {f.factor === 'DXY' || f.factor === 'Oil' ? f.raw_value.toFixed(2) : f.raw_value.toLocaleString('id-ID')}
                          {f.change_24h_pct !== null && f.change_24h_pct !== undefined && ` (${f.change_24h_pct >= 0 ? '+' : ''}${f.change_24h_pct.toFixed(2)}%)`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-3">Metodologi</h3>
                <p className="text-muted-foreground">
                  Indeks Kesehatan Rupiah (0-100) dihitung dari 7 faktor dengan bobot berbeda:
                  DXY (15%), Oil (10%), Inflasi (15%), Cadangan Devisa (15%),
                  Neraca Perdagangan (10%), Sentimen Pasar (15%), dan Nilai Tukar USD/IDR (20%).
                  Setiap faktor dinormalisasi ke skala 0-100 berdasarkan level absolut dan perubahan harian,
                  lalu dihitung rata-rata tertimbang.
                </p>
              </article>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  )
}
