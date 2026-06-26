import { Palette } from 'lucide-react'

interface ThemePickerProps {
  selected: string
  onChange: (theme: string) => void
}

const themes = [
  { id: 'default', name: 'Default', colors: ['#2EC4B6', '#FE90E8', '#B8A9FF'] },
  { id: 'dark', name: 'Dark', colors: ['#1A1A2E', '#16213E', '#0F3460'] },
  { id: 'tokyonight', name: 'Tokyo', colors: ['#1A1B26', '#7AA2F7', '#BB9AF7'] },
  { id: 'dracula', name: 'Dracula', colors: ['#282A36', '#FF79C6', '#8BE9FD'] },
  { id: 'radical', name: 'Radical', colors: ['#141321', '#FE428E', '#F8D847'] },
  { id: 'synthwave', name: 'Synth', colors: ['#2B213A', '#E2E9EC', '#EF8FE9'] },
  { id: 'github_dark', name: 'Hub Dark', colors: ['#0D1117', '#58A6FF', '#8B949E'] },
]

export const ThemePicker = ({ selected, onChange }: ThemePickerProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-3.5 h-3.5 text-wharf-orange" />
        <span className="font-mono text-xs font-bold uppercase tracking-wider">Theme</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 border-2 transition-all duration-200
              ${selected === theme.id 
                ? 'border-wharf-border-primary shadow-brutal-sm' 
                : 'border-wharf-border-secondary hover:border-wharf-border-primary'
              }
            `}
          >
            <div className="flex gap-0.5">
              {theme.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 border border-wharf-border-primary"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className={`font-mono text-[10px] font-bold ${
              selected === theme.id ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
            }`}>
              {theme.name}
            </span>
            {selected === theme.id && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-wharf-black border border-wharf-border-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}