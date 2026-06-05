import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const RANGES = [
  { key: '1d', labelKey: 'chart.range-1h' },
  { key: '5d', labelKey: 'chart.range-5h' },
  { key: '1m', labelKey: 'chart.range-1m' },
  { key: '3m', labelKey: 'chart.range-3m' },
  { key: '1y', labelKey: 'chart.range-1y' },
  { key: '5y', labelKey: 'chart.range-5y' },
  { key: 'max', labelKey: 'chart.range-max' },
]

interface TimeRangeSelectorProps {
  value: string
  onChange: (range: string) => void
}

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  const { t } = useLang()

  return (
    <div className="flex gap-1 bg-muted rounded-lg p-1">
      {RANGES.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            value === r.key
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t(r.labelKey)}
        </button>
      ))}
    </div>
  )
}
