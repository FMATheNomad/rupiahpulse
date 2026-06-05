import { useTheme } from '@/lib/theme'
import { useMemo } from 'react'

export function useChartTheme() {
  const { resolved } = useTheme()
  return useMemo(() => ({
    isDark: resolved === 'dark',
    axisLabel: { color: resolved === 'dark' ? '#d1d5db' : '#374151' },
    splitLine: { color: resolved === 'dark' ? '#374151' : '#e5e7eb' },
    tooltip: {
      backgroundColor: resolved === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
      borderColor: resolved === 'dark' ? '#4b5563' : '#e5e7eb',
    },
  }), [resolved])
}
