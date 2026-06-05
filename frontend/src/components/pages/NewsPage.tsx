import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQueryClient } from '@tanstack/react-query'
import { useNews, useRefreshNews } from '@/hooks/useApi'
import { useLang } from '@/lib/i18n'
import { Card, CardContent, Badge, ErrorState, Spinner } from '@/components/ui'

const PAGE_SIZE = 10
const COOLDOWN_SECONDS = 60

export default function NewsPage() {
  const { t } = useLang()
  const [offset, setOffset] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const queryClient = useQueryClient()

  const { data, isLoading, error, isFetching } = useNews(PAGE_SIZE, offset)
  const refreshMutation = useRefreshNews()

  const articles = data?.data || []
  const meta = data?.meta || {}
  const hasMore = meta.has_more
  const total = meta.total || 0

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((p) => Math.max(0, p - 1)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleRefresh = useCallback(async () => {
    if (cooldown > 0) return
    try {
      const res = await refreshMutation.mutateAsync()
      const status = res?.data?.status
      if (status === 'cooldown') {
        setCooldown(res.data.cooldown_remaining || COOLDOWN_SECONDS)
        return
      }
      setCooldown(COOLDOWN_SECONDS)
      setOffset(0)
      queryClient.invalidateQueries({ queryKey: ['news'] })
    } catch {
      setCooldown(5)
    }
  }, [cooldown, refreshMutation, queryClient])

  const btnDisabled = refreshMutation.isPending || cooldown > 0
  const btnLabel = refreshMutation.isPending
    ? t('news.refreshing')
    : cooldown > 0
      ? t('news.wait', { s: cooldown })
      : t('news.refresh')

  if (error) return <ErrorState message={`${t('error.load')} ${t('news.title')}`} />

  return (
    <>
      <Helmet>
        <title>{t('news.title')} | Rupiah Pulse</title>
        <meta name="description" content={t('news.subtitle')} />
        <link rel="canonical" href="https://rupiahpulse.com/news" />
      </Helmet>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('news.title')}</h1>
            <p className="text-muted-foreground">
              {total > 0
                ? `${total} ${t('news.subtitle').toLowerCase()}`
                : t('news.subtitle')}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={btnDisabled}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors
              ${btnDisabled
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-card hover:bg-accent'
              }`}
          >
            <svg className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {btnLabel}
          </button>
        </div>

        {refreshMutation.data && (
          <Card>
            <CardContent className="py-4 text-center">
              <p className={`text-sm font-medium ${
                refreshMutation.data.data?.status === 'ok' ? 'text-green-600 dark:text-green-400' :
                refreshMutation.data.data?.status === 'cooldown' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {refreshMutation.data.data?.message || ''}
              </p>
            </CardContent>
          </Card>
        )}

        {(isLoading && offset === 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4 mb-3" />
                  <div className="h-5 bg-muted animate-pulse rounded w-full mb-2" />
                  <div className="h-5 bg-muted animate-pulse rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t('news.empty')}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((article: { id: string; title: string; source: string; url: string; published_at: string; sentiment_score: number }) => (
                <Card key={article.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        !article.sentiment_score ? 'default' :
                        article.sentiment_score > 0 ? 'success' :
                        article.sentiment_score < 0 ? 'danger' : 'warning'
                      }>
                        {article.sentiment_score
                          ? t('sentiment.label', { score: `${article.sentiment_score >= 0 ? '+' : ''}${article.sentiment_score.toFixed(2)}` })
                          : t('sentiment.neutral')}
                      </Badge>
                      {article.source && (
                        <span className="text-xs text-muted-foreground">{article.source}</span>
                      )}
                    </div>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block mt-1 group">
                      <h3 className="font-medium leading-tight group-hover:text-primary transition-colors">{article.title}</h3>
                    </a>
                    {article.published_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(article.published_at).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {t('news.showing', {
                  start: offset + 1,
                  end: Math.min(offset + PAGE_SIZE, total),
                  total,
                })}
              </p>
              <div className="flex gap-2">
                {offset > 0 && (
                  <button onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}
                    className="px-4 py-2 rounded-lg border bg-card text-sm font-medium hover:bg-accent transition-colors">
                    {t('news.prev')}
                  </button>
                )}
                {hasMore && (
                  <button onClick={() => setOffset((p) => p + PAGE_SIZE)}
                    disabled={isFetching}
                    className="px-4 py-2 rounded-lg border bg-card text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50">
                    {isFetching ? <Spinner className="inline h-4 w-4" /> : t('news.load-more')}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </section>
    </>
  )
}
