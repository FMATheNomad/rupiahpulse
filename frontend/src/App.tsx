import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import HomePage from '@/components/pages/HomePage'
import HealthIndexPage from '@/components/pages/HealthIndexPage'
import HistoryPage from '@/components/pages/HistoryPage'
import WhyRupiahFallingPage from '@/components/pages/WhyRupiahFallingPage'
import PredictionPage from '@/components/pages/PredictionPage'
import CurrenciesPage from '@/components/pages/CurrenciesPage'
import DocsPage from '@/components/pages/DocsPage'
import NewsPage from '@/components/pages/NewsPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/health-index" element={<HealthIndexPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/why-rupiah-falling" element={<WhyRupiahFallingPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/currencies" element={<CurrenciesPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </Layout>
  )
}
