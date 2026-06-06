import { Helmet } from 'react-helmet-async'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function DocsPage() {
  const { t, locale } = useLang()
  const isEn = locale === 'en'

  const m = (id: string, en: string) => isEn ? en : id

  return (
    <>
      <Helmet>
        <title>{m('Dokumentasi', 'Documentation')} | Rupiah Pulse</title>
        <link rel="canonical" href="https://rupiahpulse.com/docs" />
      </Helmet>

      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{m('Dokumentasi', 'Documentation')}</h1>
          <p className="text-muted-foreground">{m('Metode, rumus, dan penyajian data Rupiah Pulse', 'Methods, formulas, and data presentation')}</p>
        </div>

        <Card>
          <CardHeader><CardTitle>1. {m('Sumber Data', 'Data Sources')}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p><strong>USD/IDR, SGD/IDR, MYR/IDR, CNY/IDR, JPY/IDR, THB/IDR, EUR/IDR, GBP/IDR, AUD/IDR:</strong> Yahoo Finance (USDIDR=X, SGDIDR=X, dst) — <em>{m('real-time selama market forex buka (Senin-Jumat)', 'real-time during forex market hours (Mon-Fri)')}</em></p>
            <p><strong>DXY (Indeks Dolar AS):</strong> Yahoo Finance (DX-Y.NYB)</p>
            <p><strong>Oil (Crude Oil):</strong> Yahoo Finance (CL=F)</p>
            <p><strong>Gold (Emas):</strong> Stooq (XAUUSD)</p>
            <p><strong>Data Makro (Inflasi, Cadangan Devisa, Neraca Perdagangan):</strong> World Bank API</p>
            <p><strong>Berita & Sentimen:</strong> GDELT Project 2.1 Doc API</p>
            <p className="text-muted-foreground text-xs mt-2">* {m('Semua data dari API gratis. Update bervariasi dari real-time hingga tahunan.', 'All data from free APIs. Update frequency varies from real-time to annual.')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. {m('Rumus Health Index', 'Health Index Formula')}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            <p><strong>{m('Rumus Umum:', 'General Formula:')}</strong></p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              Score = (DXY × 0.15) + (Oil × 0.10) + (Inflasi × 0.10) + (Cadangan × 0.10) + (Neraca × 0.10) + (Sentimen × 0.10) + (USD/IDR × 0.35)
            </div>
            <p className="text-muted-foreground">* {m('Setiap subscore di-clamp ke range 0-100', 'Each subscore is clamped to 0-100')}</p>

            <div className="space-y-2">
              <p><strong>{m('Normalisasi per Faktor:', 'Per-Factor Normalization:')}</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {[
                  { n: 'DXY', f: '100 - (DXY - 95) × 8', b: '95 (baseline)', k: '15%' },
                  { n: 'Oil', f: '100 - max(0, Oil - 65) × 2', b: '$65/barel', k: '10%' },
                  { n: m('Inflasi', 'Inflation'), f: '100 - (Inflasi - 2.5) × 40', b: '2.5% (target BI)', k: '10%' },
                  { n: m('Cadangan Devisa', 'FX Reserves'), f: '(ratio - 0.7) × 350', b: '$140.000M', k: '10%' },
                  { n: m('Neraca Perdagangan', 'Trade Balance'), f: '50 + (surplus / 1500)', b: m('Surplus minimum', 'Min surplus'), k: '10%' },
                  { n: m('Sentimen Pasar', 'Market Sentiment'), f: '50 + (sentimen × 50)', b: '0 (netral)', k: '10%' },
                  { n: 'USD/IDR Rate', f: '100 - max(0, rate - 15500) / 35', b: 'Rp 15.500', k: '35%' },
                ].map(({ n, f, b, k }) => (
                  <div key={n} className="bg-muted p-2 rounded">
                    <span className="font-semibold">{n}</span>
                    <div className="font-mono text-[11px] mt-0.5">{f}</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">{m('Baseline:', 'Baseline:')} {b} | {m('Bobot:', 'Weight:')} {k}</div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs"><strong>Kategori:</strong> Strong ≥ 75 | Neutral 50-74 | Weak &lt; 50</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3. {m('Metode Prediksi', 'Prediction Method')}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            <p><strong>{m('Algoritma: Exponentially-Weighted Moving Average Regression', 'Algorithm: Exponentially-Weighted Moving Average Regression')}</strong></p>
            <p>{m('Data historis 365 hari, dengan bobot eksponensial:', '365 days of historical data, with exponential weighting:')}</p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              weight = e^(-days_ago / half_life)
            </div>
            <p><strong>{m('3 Horizon Half-Life:', '3 Half-Life Horizons:')}</strong></p>
            <div className="bg-muted p-2 rounded text-xs">
              <p><strong>30 hari:</strong> bobot 50% — {m('menangkap akselerasi jangka pendek', 'captures short-term acceleration')}</p>
              <p><strong>60 hari:</strong> bobot 30% — {m('tren menengah', 'medium-term trend')}</p>
              <p><strong>180 hari:</strong> bobot 20% — {m('arah jangka panjang', 'long-term direction')}</p>
            </div>
            <p><strong>{m('Akselerasi:', 'Acceleration:')}</strong> {m('Selisih slope antara 2 periode waktu untuk mengukur apakah pelemahan/penguatan makin cepat.', 'Difference in slope between 2 time periods to measure whether weakening/strengthening is accelerating.')}</p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              accel = (daily_late − daily_early) / days_between
            </div>
            <p><strong>{m('Effective Daily Change:', 'Effective Daily Change:')}</strong></p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              effective = raw_slope × accel_mul × sentiment_adj × consensus_penalty
            </div>
            <p><strong>{m('Proyeksi:', 'Projection:')}</strong></p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              predicted = latest_rate + (effective × days)
            </div>
            <p className="text-muted-foreground text-xs">{m('* Mode ini cocok untuk lihat arah tren, bukan untuk keputusan finansial.', '* This model is suitable for trend direction, not financial decisions.')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>4. {m('Explanation Engine (NLG)', 'Explanation Engine (NLG)')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p>{m('Menggunakan rule-based Natural Language Generation (bukan AI/LLM).', 'Uses rule-based Natural Language Generation (not AI/LLM).')}</p>
            <ol className="list-decimal list-inside space-y-1 text-sm bg-muted p-3 rounded">
              <li>{m('Sortir faktor berdasarkan kontribusi (subscore × weight)', 'Sort factors by contribution (subscore × weight)')}</li>
              <li>{m('Ambil 2-4 faktor teratas dengan deviasi > 2 dari 50', 'Take top 2-4 factors with deviation > 2 from 50')}</li>
              <li>{m('Generate kalimat dalam Bahasa Indonesia/Inggris berdasarkan template per faktor', 'Generate sentence in Indonesian/English based on per-factor template')}</li>
              <li>{m('Gabungkan dengan konjungsi "dan" atau "and"', 'Combine with conjunction "dan" or "and"')}</li>
            </ol>
            <p className="text-xs text-muted-foreground">{m('Kelebihan: deterministik, production-safe, tanpa API key, tanpa biaya LLM.', 'Advantages: deterministic, production-safe, no API key, no LLM costs.')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>5. {m('Penyajian Data', 'Data Presentation')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p><strong>Chart:</strong> Apache ECharts — {m('time-series, gauge, bar chart, sparkline', 'time-series, gauge, bar chart, sparkline')}</p>
            <p><strong>Range:</strong> 1H, 5H, 1M, 3M, 1Y, 5Y, Max — {m('agregasi harian', 'daily aggregation')}</p>
            <p><strong>Dark Mode:</strong> {m('CSS variables + deteksi preferensi sistem', 'CSS variables + system preference detection')}</p>
            <p><strong>i18n:</strong> Bahasa Indonesia + English — {m('toggle manual atau auto-deteksi browser', 'manual toggle or browser auto-detection')}</p>
            <p><strong>API Envelope:</strong></p>
            <div className="bg-muted p-3 rounded font-mono text-xs">
              {`{ "data": {}, "meta": { "total": 0, "range": "1y", "timestamp": "..." } }`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>6. {m('Arsitektur', 'Architecture')}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            <p><strong>Frontend:</strong> React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui + TanStack Query + ECharts</p>
            <p><strong>Backend:</strong> FastAPI (Python 3.13) + SQLAlchemy + PostgreSQL + Alembic + APScheduler</p>
            <p><strong>Deployment:</strong> Railway — 1 container via Docker + supervisord (nginx + uvicorn + worker)</p>
            <p><strong>Data Flow:</strong> Worker fetch → Database → API → Frontend (auto-refresh 5 menit)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>7. {m('Keterbatasan', 'Limitations')}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>• {m('Akurasi prediksi menurun untuk horizon &gt; 1 bulan', 'Prediction accuracy decreases for horizons &gt; 1 month')}</p>
            <p>• {m('Data makro (inflasi, cadangan) dari World Bank update tahunan', 'Macro data (inflation, reserves) from World Bank updates annually')}</p>
            <p>• {m('Yahoo Finance dapat memblock IP jika terlalu banyak request', 'Yahoo Finance may block IP if too many requests')}</p>
            <p>• {m('Tidak menangani event mendadak (kebijakan BI, krisis global)', 'Does not handle sudden events (BI policy, global crisis)')}</p>
            <p>• {m('Model prediksi adalah indikasi arah, bukan rekomendasi finansial', 'Prediction model is a directional indicator, not financial advice')}</p>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
