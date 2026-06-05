import { useQuery, useMutation } from '@tanstack/react-query'
import { API_BASE } from '@/lib/utils'

async function fetchJson(url: string) {
  const res = await fetch(`${API_BASE}${url}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function postJson(url: string) {
  const res = await fetch(`${API_BASE}${url}`, { method: 'POST' })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export function useUsdIdr() {
  return useQuery({
    queryKey: ['usd-idr'],
    queryFn: () => fetchJson('/api/v1/usd-idr'),
    refetchInterval: 300000,
  })
}

export function useUsdIdrHistory(range = '1y') {
  return useQuery({
    queryKey: ['usd-idr-history', range],
    queryFn: () => fetchJson(`/api/v1/usd-idr/history?range=${range}&granularity=daily`),
    refetchInterval: 300000,
  })
}

export function useHealthIndex() {
  return useQuery({
    queryKey: ['health-index'],
    queryFn: () => fetchJson('/api/v1/health-index'),
    refetchInterval: 300000,
  })
}

export function useHistory(range = '1y') {
  return useQuery({
    queryKey: ['history', range],
    queryFn: () => fetchJson(`/api/v1/history?range=${range}`),
  })
}

export function usePrediction() {
  return useQuery({
    queryKey: ['prediction'],
    queryFn: () => fetchJson('/api/v1/prediction'),
    refetchInterval: 600000,
  })
}

export function useExplanation() {
  return useQuery({
    queryKey: ['explanation'],
    queryFn: () => fetchJson('/api/v1/explanation'),
    refetchInterval: 300000,
  })
}

export function useNews(limit = 10, offset = 0) {
  return useQuery({
    queryKey: ['news', limit, offset],
    queryFn: () => fetchJson(`/api/v1/news?limit=${limit}&offset=${offset}`),
    refetchInterval: 600000,
  })
}

export function useRefreshNews() {
  return useMutation({
    mutationFn: () => postJson('/api/v1/news/refresh'),
  })
}
