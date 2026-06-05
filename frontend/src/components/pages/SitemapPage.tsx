import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function SitemapPage() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/sitemap.xml') {
      const urls = [
        { loc: 'https://rupiahpulse.com', priority: 1.0 },
        { loc: 'https://rupiahpulse.com/health-index', priority: 0.9 },
        { loc: 'https://rupiahpulse.com/history', priority: 0.8 },
        { loc: 'https://rupiahpulse.com/why-rupiah-falling', priority: 0.9 },
        { loc: 'https://rupiahpulse.com/news', priority: 0.7 },
      ]

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>always</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

      const blob = new Blob([sitemap], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      window.location.href = url
    }
  }, [location])

  return null
}
