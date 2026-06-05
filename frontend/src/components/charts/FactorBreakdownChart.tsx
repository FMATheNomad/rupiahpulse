import ReactEChartsCore from 'echarts-for-react'
import { Skeleton } from '@/components/ui'
import { useChartTheme } from '@/hooks/useChartTheme'
import { useLang } from '@/lib/i18n'

interface FactorBreakdownChartProps {
  factors: Array<{ factor: string; subscore: number; contribution: number }>
  loading?: boolean
}

export default function FactorBreakdownChart({ factors, loading }: FactorBreakdownChartProps) {
  const { t } = useLang()
  const chartTheme = useChartTheme()

  if (loading) return <Skeleton className="h-[300px] w-full rounded-lg" />
  if (!factors || factors.length === 0) {
    return (
      <div className="h-[300px] w-full rounded-lg border bg-card flex items-center justify-center text-muted-foreground">
        {t('empty.no-data')}
      </div>
    )
  }

  const sorted = [...factors].sort((a, b) => b.subscore - a.subscore)

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: { name: string; value: number; marker: string }[]) => {
        const p = params[0]
        return `${p.name}<br/>${p.value}/100`
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value' as const, min: 0, max: 100,
      splitLine: { show: false },
      axisLabel: { ...chartTheme.axisLabel, formatter: '{value}' },
    },
    yAxis: {
      type: 'category' as const,
      data: sorted.map((f) => f.factor),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: chartTheme.axisLabel,
    },
    series: [{
      type: 'bar' as const,
      data: sorted.map((f) => ({
        value: Math.round(f.subscore),
        itemStyle: { color: f.subscore >= 70 ? '#16a34a' : f.subscore >= 40 ? '#ca8a04' : '#dc2626' },
      })),
      barWidth: '60%',
      label: {
        show: true,
        position: 'right' as const,
        formatter: (params: { value: number }) => `${params.value}/100`,
        fontSize: 12,
        color: chartTheme.axisLabel.color,
      },
    }],
  }

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <ReactEChartsCore option={option} style={{ height: `${Math.max(250, factors.length * 50)}px` }} lazyUpdate />
    </div>
  )
}
