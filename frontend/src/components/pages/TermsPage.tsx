import { Helmet } from 'react-helmet-async'
import { useLang } from '@/lib/i18n'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function TermsPage() {
  const { locale } = useLang()
  const isEn = locale === 'en'

  const c = (id: string, en: string) => isEn ? en : id

  return (
    <>
      <Helmet>
        <title>{c('Syarat & Ketentuan', 'Terms of Service')} | Rupiah Pulse</title>
        <link rel="canonical" href="https://rupiahpulse.com/terms" />
      </Helmet>

      <section className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">{c('Syarat & Ketentuan', 'Terms of Service')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{c('Berlaku efektif', 'Effective')}: June 2026</p>
        </div>

        <Card>
          <CardHeader><CardTitle>1. {c('Layanan', 'Service')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>{c('Rupiah Pulse menyediakan dashboard analisis dan API untuk data nilai tukar, indeks kesehatan Rupiah, prediksi, dan indikator ekonomi terkait.', 'Rupiah Pulse provides analytical dashboard and API access for exchange rate data, Rupiah Health Index, predictions, and related economic indicators.')}</p>
            <p>{c('Data yang ditampilkan bersumber dari API publik pihak ketiga termasuk Yahoo Finance, World Bank, GDELT, dan Stooq. Rupiah Pulse memproses, mengagregasi, dan menyajikan data tersebut dalam bentuk analisis dan indeks.', 'Data displayed is sourced from public third-party APIs including Yahoo Finance, World Bank, GDELT, and Stooq. Rupiah Pulse processes, aggregates, and presents this data in the form of analysis and indexes.')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. {c('Penggunaan API', 'API Usage')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>{c('Pengguna API Rupiah Pulse setuju untuk:', 'Rupiah Pulse API users agree to:')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{c('Tidak menggunakan data untuk tujuan ilegal', 'Not use the data for illegal purposes')}</li>
              <li>{c('Tidak menjual kembali data mentah tanpa pengolahan', 'Not resell raw data without processing')}</li>
              <li>{c('Mematuhi batas rate limit sesuai tingkatan langganan', 'Comply with rate limits per subscription tier')}</li>
              <li>{c('Menjaga kerahasiaan API key', 'Maintain API key confidentiality')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3. {c('Sumber Data', 'Data Sources')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>{c('Data yang disajikan melalui Rupiah Pulse berasal dari sumber berikut dengan ketentuan masing-masing:', 'Data presented through Rupiah Pulse originates from the following sources with their respective terms:')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Yahoo Finance</strong> — {c('data pasar keuangan untuk penggunaan non-komersial', 'financial market data for non-commercial use')}</li>
              <li><strong>World Bank API</strong> — {c('data makroekonomi (domain publik)', 'macroeconomic data (public domain)')}</li>
              <li><strong>GDELT Project</strong> — {c('data berita dan sentimen (domain publik)', 'news and sentiment data (public domain)')}</li>
              <li><strong>Stooq</strong> — {c('data komoditas (penggunaan pribadi)', 'commodity data (personal use)')}</li>
            </ul>
            <p className="text-muted-foreground text-xs mt-2">
              * {c('Rupiah Pulse tidak menjual data mentah dari sumber tersebut, melainkan hasil olahan dan analisis.', 'Rupiah Pulse does not sell raw data from these sources, but rather processed analytics and analysis.')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>4. {c('Batasan Tanggung Jawab', 'Limitation of Liability')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>{c('Data yang disediakan Rupiah Pulse bersifat informatif dan bukan merupakan rekomendasi finansial. Keputusan investasi atau trading sepenuhnya tanggung jawab pengguna.', 'Data provided by Rupiah Pulse is for informational purposes only and does not constitute financial advice. Investment or trading decisions are solely the responsibility of the user.')}</p>
            <p className="font-semibold">{c('Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan data ini.', 'We are not liable for any losses arising from the use of this data.')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>5. {c('Privasi & Data', 'Privacy & Data')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>{c('Kami tidak mengumpulkan data pribadi pengguna secara aktif. Data yang dikumpulkan terbatas pada:', 'We do not actively collect personal user data. Data collected is limited to:')}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{c('Alamat email (untuk pembuatan akun API)', 'Email address (for API account creation)')}</li>
              <li>{c('Log akses API anonim (untuk rate limiting)', 'Anonymous API access logs (for rate limiting)')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>6. {c('Pembayaran', 'Payments')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed space-y-2">
            <p>{c('Pembayaran diproses melalui Polar.sh sebagai Merchant of Record. Semua transaksi tunduk pada syarat dan ketentuan Polar.sh.', 'Payments are processed through Polar.sh as Merchant of Record. All transactions are subject to Polar.sh terms and conditions.')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>7. {c('Perubahan Syarat', 'Changes to Terms')}</CardTitle></CardHeader>
          <CardContent className="text-sm leading-relaxed">
            <p>{c('Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diumumkan melalui halaman ini.', 'We reserve the right to modify these terms at any time. Changes will be announced on this page.')}</p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          {c('Terakhir diperbarui', 'Last updated')}: June 2026
        </p>
      </section>
    </>
  )
}
