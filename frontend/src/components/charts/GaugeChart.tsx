import ReactEChartsCore from 'echarts-for-react'
import { Skeleton } from '@/components/ui'

interface GaugeChartProps {
  score: number
  loading?: boolean
}

export default function GaugeChart({ score, loading }: GaugeChartProps) {
  if (loading) return <Skeleton className="h-[280px] w-full rounded-lg" />

  const categoryColor = score >= 70 ? '#16a34a' : score >= 40 ? '#ca8a04' : '#dc2626'
  const categoryLabel = score >= 70 ? 'Strong' : score >= 40 ? 'Neutral' : 'Weak'

  const option = {
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge' as const,
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      pointer: { show: true, length: '60%', width: 6 },
      progress: {
        show: true,
        width: 20,
        itemStyle: { color: categoryColor },
      },
      axisLine: {
        lineStyle: {
          width: 20,
          color: [
            [0.39, '#dc2626'],
            [0.69, '#ca8a04'],
            [1, '#16a34a'],
          ],
        },
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        offsetCenter: [0, '60%'],
        valueAnimation: true,
        formatter: (params: any) => `${params.value}\n${categoryLabel}`,
        rich: {
          value: { fontSize: 36, fontWeight: 'bold', color: categoryColor },
          name: { fontSize: 16, color: '#9ca3af', padding: [8, 0, 0, 0] },
        },
      },
      data: [{ value: score }],
    }],
  }

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <ReactEChartsCore option={option} style={{ height: '280px' }} lazyUpdate />
    </div>
  )
}
