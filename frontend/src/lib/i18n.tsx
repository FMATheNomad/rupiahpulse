import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type LangMode = 'id' | 'en' | 'auto'

interface LangContextType {
  mode: LangMode
  locale: 'id' | 'en'
  setMode: (mode: LangMode) => void
  t: (id: string, params?: Record<string, string | number>) => string
}

const dict: Record<string, { id: string; en: string }> = {
  'nav.beranda': { id: 'Beranda', en: 'Home' },
  'nav.health-index': { id: 'Health Index', en: 'Health Index' },
  'nav.prediksi': { id: 'Prediksi', en: 'Prediction' },
  'nav.riwayat': { id: 'Riwayat', en: 'History' },
  'nav.analisis': { id: 'Analisis', en: 'Analysis' },
  'nav.berita': { id: 'Berita', en: 'News' },
  'nav.rupiah-pulse': { id: 'Rupiah Pulse', en: 'Rupiah Pulse' },

  'footer.data-sources': { id: 'Data diperbarui setiap 5 menit. Sumber: open.er-api.com, Yahoo Finance, Stooq, World Bank, GDELT.', en: 'Data updated every 5 minutes. Sources: open.er-api.com, Yahoo Finance, Stooq, World Bank, GDELT.' },

  'theme.light': { id: 'Terang', en: 'Light' },
  'theme.dark': { id: 'Gelap', en: 'Dark' },
  'theme.system': { id: 'Sistem', en: 'System' },
  'lang.id': { id: 'Indonesia', en: 'Indonesian' },
  'lang.en': { id: 'Inggris', en: 'English' },
  'lang.auto': { id: 'Otomatis', en: 'Auto' },

  'loading': { id: 'Memuat...', en: 'Loading...' },
  'error.load': { id: 'Gagal memuat data', en: 'Failed to load data' },
  'error.generic': { id: 'Silakan coba lagi nanti.', en: 'Please try again later.' },
  'empty.no-data': { id: 'Belum ada data tersedia', en: 'No data available' },
  'empty.no-range': { id: 'Belum ada data untuk rentang ini', en: 'No data for this range' },

  'home.title': { id: 'Indeks Kesehatan Rupiah Real-time', en: 'Real-time Rupiah Health Index' },
  'home.usd-idr': { id: 'USD/IDR', en: 'USD/IDR' },
  'home.health-index': { id: 'Health Index', en: 'Health Index' },
  'home.status': { id: 'Status', en: 'Status' },
  'home.analysis': { id: 'Analisis Pergerakan Rupiah', en: 'Rupiah Movement Analysis' },

  'health.title': { id: 'Health Index', en: 'Health Index' },
  'health.subtitle': { id: 'Indeks Kesehatan Rupiah terhadap USD', en: 'Rupiah Health Index against USD' },
  'health.history': { id: 'Riwayat Health Index', en: 'Health Index History' },
  'health.score-label': { id: 'Skor Health Index dari Waktu ke Waktu', en: 'Health Index Score Over Time' },

  'history.title': { id: 'Riwayat', en: 'History' },
  'history.subtitle': { id: 'Data historis USD/IDR dan Health Index', en: 'Historical USD/IDR and Health Index data' },
  'history.usd-idr': { id: 'USD/IDR', en: 'USD/IDR' },
  'history.health-index': { id: 'Health Index', en: 'Health Index' },
  'history.table-title': { id: 'Data Historis Health Index', en: 'Health Index History Data' },
  'history.table-date': { id: 'Tanggal', en: 'Date' },
  'history.table-score': { id: 'Skor', en: 'Score' },
  'history.table-category': { id: 'Kategori', en: 'Category' },

  'analysis.title': { id: 'Analisis Pergerakan Rupiah', en: 'Rupiah Movement Analysis' },
  'analysis.subtitle': { id: 'Penjelasan lengkap faktor-faktor yang mempengaruhi Rupiah', en: 'Complete explanation of factors affecting Rupiah' },
  'analysis.explanation': { id: 'Penjelasan Hari Ini', en: "Today's Explanation" },
  'analysis.detail': { id: 'Detail Faktor', en: 'Factor Details' },
  'analysis.weight': { id: 'Bobot', en: 'Weight' },
  'analysis.contribution': { id: 'Kontribusi', en: 'Contribution' },
  'analysis.actual': { id: 'Nilai aktual', en: 'Actual value' },
  'analysis.methodology': { id: 'Metodologi', en: 'Methodology' },

  'prediction.title': { id: 'Prediksi Rupiah', en: 'Rupiah Prediction' },
  'prediction.subtitle': { id: 'Proyeksi pergerakan USD/IDR berdasarkan tren historis dan sentimen pasar', en: 'USD/IDR projection based on historical trends and market sentiment' },
  'prediction.projection': { id: 'Proyeksi USD/IDR', en: 'USD/IDR Projection' },
  'prediction.1m': { id: '1 Bulan', en: '1 Month' },
  'prediction.3m': { id: '3 Bulan', en: '3 Months' },
  'prediction.6m': { id: '6 Bulan', en: '6 Months' },
  'prediction.1y': { id: '1 Tahun', en: '1 Year' },
  'prediction.current-trend': { id: 'Tren Saat Ini', en: 'Current Trend' },
  'prediction.market-sentiment': { id: 'Sentimen Pasar', en: 'Market Sentiment' },
  'prediction.current-rate': { id: 'Nilai Saat Ini', en: 'Current Rate' },
  'prediction.accuracy': { id: 'Akurasi model', en: 'Model accuracy' },
  'prediction.volatility': { id: 'Volatilitas', en: 'Volatility' },

  'news.title': { id: 'Berita & Sentimen', en: 'News & Sentiment' },
  'news.subtitle': { id: 'Berita terbaru terkait Rupiah dan ekonomi Indonesia dari GDELT', en: 'Latest news on Rupiah and Indonesian economy from GDELT' },
  'news.refresh': { id: 'Refresh', en: 'Refresh' },
  'news.refreshing': { id: 'Memperbarui...', en: 'Refreshing...' },
  'news.wait': { id: 'Tunggu {s}s', en: 'Wait {s}s' },
  'news.load-more': { id: 'Muat lebih banyak', en: 'Load more' },
  'news.prev': { id: 'Sebelumnya', en: 'Previous' },
  'news.showing': { id: 'Menampilkan {start}-{end} dari {total} berita', en: 'Showing {start}-{end} of {total} news' },
  'news.empty': { id: 'Belum ada berita tersedia. Klik Refresh untuk mengambil berita terbaru.', en: 'No news available. Click Refresh to fetch latest news.' },
  'news.refresh-ok': { id: 'Berita berhasil diperbarui!', en: 'News refreshed successfully!' },
  'news.rate-limited': { id: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.', en: 'Too many requests. Please try again in a few minutes.' },
  'news.cooldown': { id: 'Mohon tunggu {s} detik sebelum refresh lagi', en: 'Please wait {s} seconds before refreshing again' },

  'chart.usd-idr-over-time': { id: 'USD/IDR dari Waktu ke Waktu', en: 'USD/IDR Over Time' },
  'chart.health-index-over-time': { id: 'Health Index dari Waktu ke Waktu', en: 'Health Index Over Time' },
  'chart.range-1h': { id: '1H', en: '1H' },
  'chart.range-5h': { id: '5H', en: '5H' },
  'chart.range-1m': { id: '1M', en: '1M' },
  'chart.range-3m': { id: '3M', en: '3M' },
  'chart.range-1y': { id: '1Y', en: '1Y' },
  'chart.range-5y': { id: '5Y', en: '5Y' },
  'chart.range-max': { id: 'Max', en: 'Max' },
  'chart.fetch-error': { id: 'Gagal memuat data', en: 'Failed to load data' },
  'chart.loading': { id: 'Memuat...', en: 'Loading...' },

  'gauge.strong': { id: 'Strong', en: 'Strong' },
  'gauge.neutral': { id: 'Neutral', en: 'Neutral' },
  'gauge.weak': { id: 'Weak', en: 'Weak' },

  'sentiment.positive': { id: 'positif', en: 'positive' },
  'sentiment.negative': { id: 'negatif', en: 'negative' },
  'sentiment.neutral': { id: 'Netral', en: 'Neutral' },
  'sentiment.bullish': { id: 'Bullish', en: 'Bullish' },
  'sentiment.bearish': { id: 'Bearish', en: 'Bearish' },
  'sentiment.bullish-label': { id: 'Bullish', en: 'Bullish' },
  'sentiment.bearish-label': { id: 'Bearish', en: 'Bearish' },
  'sentiment.neutral-label': { id: 'Netral', en: 'Neutral' },
}

const LangContext = createContext<LangContextType>({
  mode: 'auto',
  locale: 'id',
  setMode: () => {},
  t: (id) => id,
})

function detectBrowserLang(): 'id' | 'en' {
  try {
    const lang = navigator.language || ''
    if (lang.startsWith('id')) return 'id'
    return 'en'
  } catch {
    return 'id'
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LangMode>(() => {
    const saved = localStorage.getItem('rupiahpulse-lang') as LangMode | null
    return saved || 'auto'
  })

  const [browserLang, setBrowserLang] = useState<'id' | 'en'>(detectBrowserLang)

  useEffect(() => {
    // Can't listen for navigator.language changes easily, check once
    setBrowserLang(detectBrowserLang())
  }, [])

  const locale = mode === 'auto' ? browserLang : mode

  const setMode = (newMode: LangMode) => {
    setModeState(newMode)
    localStorage.setItem('rupiahpulse-lang', newMode)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const entry = dict[key]
    if (!entry) return key
    let text = entry[locale]
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  return (
    <LangContext.Provider value={{ mode, locale, setMode, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
