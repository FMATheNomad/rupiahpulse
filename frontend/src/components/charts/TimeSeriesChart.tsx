import ReactEChartsCore from 'echarts-for-react'
import { Skeleton } from '@/components/ui'
import { useChartTheme } from '@/hooks/useChartTheme'

interface TimeSeriesPoint {
  timestamp_bucket: string
  score?: number
  rate?: number
}

interface TimeSeriesChartProps {
  data: TimeSeriesPoint[]
  type: 'score' | 'rate'
  title?: string | false
  loading?: boolean
  error?: boolean
}

export default function TimeSeriesChart({ data, type, title, loading, error }: TimeSeriesChartProps) {
  const chartTheme = useChartTheme()

  if (loading) return <Skeleton className="h-[400px] w-full rounded-lg" />
  if (error) return <div className="h-[400px] w-full rounded-lg border bg-card flex items-center justify-center text-muted-foreground">Failed to load</div>
  if (!data || data.length === 0) return <div className="h-[400px] w-full rounded-lg border bg-card flex items-center justify-center text-muted-foreground">No data</div>

  const seriesData = [...data].reverse()
    .map((d) => [d.timestamp_bucket, type === 'score' ? d.score : d.rate])
    .filter(([, val]) => val !== undefined && val !== null)

  if (seriesData.length < 2) {
    const val = type === 'rate' ? data[0]?.rate : data[0]?.score
    const label = type === 'rate' ? `Rp ${val?.toLocaleString('id-ID') || '-'}` : `Score: ${val || '-'}`
    return (
      <div className="h-[400px] w-full rounded-lg border bg-card flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">{label}</p>
        </div>
      </div>
    )
  }

  const option = {
    backgroundColor: 'transparent',
    title: typeof title === 'string'
      ? { text: title, left: 'center', textStyle: { fontSize: 14, color: chartTheme.axisLabel.color } }
      : undefined,
    tooltip: {
      ...chartTheme.tooltip,
      trigger: 'axis' as const,
      formatter: (params: { value: [string, number] }[]) => {
        if (!params?.length) return ''
        const [ts, val] = params[0].value
        const date = new Date(ts).toLocaleDateString()
        const formatted = type === 'rate'
          ? `Rp ${val.toLocaleString('id-ID')}`
          : `Score: ${val}/100`
        return `${date}<br/>${formatted}`
      },
    },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'time' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: {
        ...chartTheme.axisLabel,
        formatter: (v: number) => {
          const d = new Date(v)
          return `${d.getDate()}/${d.getMonth() + 1}`
        },
      },
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { type: 'dashed', color: chartTheme.splitLine.color, width: 1, opacity: 0.5 } },
      axisLabel: {
        ...chartTheme.axisLabel,
        formatter: type === 'rate'
          ? (v: number) => `Rp${(v / 1000).toFixed(0)}rb`
          : (v: number) => `${v}`,
      },
    },
    series: [{
      type: 'line' as const,
      smooth: true,
      data: seriesData,
      lineStyle: { color: type === 'score' ? '#2563eb' : '#059669', width: 2 },
      areaStyle: {
        color: type === 'score'
          ? { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(37,99,235,0.2)' }, { offset: 1, color: 'rgba(37,99,235,0.02)' }] }
          : { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(5,150,105,0.2)' }, { offset: 1, color: 'rgba(5,150,105,0.02)' }] },
      },
      showSymbol: false,
      itemStyle: { color: type === 'score' ? '#2563eb' : '#059669' },
      connectNulls: true,
    }],
    dataZoom: [{ type: 'inside' as const, start: 0, end: 100 }],
  }

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <ReactEChartsCore option={option} style={{ height: '400px' }} lazyUpdate />
    </div>
  )
}
