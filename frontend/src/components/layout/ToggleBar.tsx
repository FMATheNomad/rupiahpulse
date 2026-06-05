import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const modes = ['light', 'system', 'dark'] as const
const icons = { light: Sun, system: Monitor, dark: Moon }

export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  const { t } = useLang()
  const Icon = icons[mode]

  return (
    <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
      {modes.map((m) => {
        const MIcon = icons[m]
        const isActive = mode === m
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            title={t(`theme.${m}`)}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isActive ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <MIcon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

const langs = ['id', 'en', 'auto'] as const
const langIcons = { id: 'ID', en: 'EN', auto: 'A' }

export function LangToggle() {
  const { mode, setMode } = useLang()

  return (
    <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
      {langs.map((l) => {
        const isActive = mode === l
        return (
          <button
            key={l}
            onClick={() => setMode(l)}
            className={cn(
              'px-1.5 py-1 rounded-md text-xs font-medium transition-colors',
              isActive ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {langIcons[l]}
          </button>
        )
      })}
    </div>
  )
}
