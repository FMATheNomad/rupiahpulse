import ReactEChartsCore from 'echarts-for-react'
import { Skeleton } from '@/components/ui'

interface GaugeChartProps {
  score: number
  loading?: boolean
}

export default function GaugeChart({ score, loading }: GaugeChartProps) {
  if (loading) return <Skeleton className="h-[280px] w-full rounded-lg" />

  const safeScore = typeof score === 'number' && !isNaN(score) ? score : 0
  const categoryColor = safeScore >= 70 ? '#16a34a' : safeScore >= 40 ? '#ca8a04' : '#dc2626'
  const categoryLabel = safeScore >= 70 ? 'Strong' : safeScore >= 40 ? 'Neutral' : 'Weak'

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
        offsetCenter: [0, '40%'],
        valueAnimation: true,
        formatter: `{value}`,
        rich: {
          value: { fontSize: 36, fontWeight: 'bold', color: categoryColor },
        },
      },
      data: [{ value: safeScore }],
    }],
  }

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <ReactEChartsCore option={option} style={{ height: '250px' }} lazyUpdate />
      <div className="text-center mt-1">
        <span
          className="inline-block text-sm font-semibold px-3 py-1 rounded-full"
          style={{
            backgroundColor: safeScore >= 70 ? '#16a34a20' : safeScore >= 40 ? '#ca8a0420' : '#dc262620',
            color: categoryColor,
          }}
        >
          {categoryLabel}
        </span>
      </div>
    </div>
  )
}
