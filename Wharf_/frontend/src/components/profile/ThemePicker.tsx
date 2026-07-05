import { Check } from 'lucide-react';

interface ThemePickerProps {
  selected: string;
  onChange: (theme: string) => void;
}

const themes = [
  {
    id: 'default',
    name: 'Default',
    colors: ['#2EC4B6', '#FE90E8', '#B8A9FF'],
    description: 'Vibrant & balanced',
    category: 'Popular',
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: ['#1A1A2E', '#16213E', '#0F3460'],
    description: 'Deep & moody',
    category: 'Dark',
  },
  {
    id: 'tokyonight',
    name: 'Tokyo Night',
    colors: ['#1A1B26', '#7AA2F7', '#BB9AF7'],
    description: 'Neon vibes',
    category: 'Popular',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: ['#282A36', '#FF79C6', '#8BE9FD'],
    description: 'Dark & colorful',
    category: 'Popular',
  },
  {
    id: 'radical',
    name: 'Radical',
    colors: ['#141321', '#FE428E', '#F8D847'],
    description: 'Bold & energetic',
    category: 'Vibrant',
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    colors: ['#2B213A', '#E2E9EC', '#EF8FE9'],
    description: 'Retro future',
    category: 'Vibrant',
  },
  {
    id: 'github_dark',
    name: 'GitHub Dark',
    colors: ['#0D1117', '#58A6FF', '#8B949E'],
    description: 'Clean & minimal',
    category: 'Dark',
  },
];

export const ThemePicker = ({ selected, onChange }: ThemePickerProps) => {
  const selectedTheme = themes.find((t) => t.id === selected);

  return (
    <div className="space-y-4">
      {/* Theme Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {themes.map((theme) => {
          const isActive = selected === theme.id;

          return (
            <button
              key={theme.id}
              onClick={() => onChange(theme.id)}
              className={`
                group relative flex items-center gap-3 p-3 border-2 transition-all duration-200 rounded-xl cursor-pointer 
                ${
                  isActive
                    ? 'border-wharf-border-primary bg-wharf-surface-secondary shadow-brutal-sm'
                    : 'border-wharf-border-primary hover:bg-wharf-surface-secondary/50 hover:shadow-brutal-sm'
                }
              `}
            >
              {/* Color Swatches */}
              <div className="flex gap-0.75">
                {theme.colors.map((color, i) => (
                  <div
                    key={i}
                    className={`
                      w-4 h-4 border border-wharf-border-primary transition-all duration-200 `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Theme Info */}
              <div className="flex-1 text-left min-w-0">
                <span
                  className={`font-mono text-xs font-bold transition-colors block truncate ${
                    isActive
                      ? 'text-wharf-text-primary'
                      : 'text-wharf-text-secondary group-hover:text-wharf-text-primary'
                  }`}
                >
                  {theme.name}
                </span>
                <span className="font-mono text-[9px] text-wharf-text-tertiary block truncate capitalize">
                  {theme.description}
                </span>
              </div>

              {/* Active Indicator */}
              {isActive && (
                <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-wharf-green-dark border border-wharf-border-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-wharf-black" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] font-bold text-wharf-text-primary uppercase tracking-wider">
            Available: {themes.length} themes
          </span>
        </div>
        {selectedTheme && (
          <span className="font-mono text-[12px] text-wharf-text-primary flex items-center gap-1.5">
            {' '}
            Selected Theme: [
            <span className="inline-flex gap-0.5">
              {selectedTheme.colors.map((color, i) => (
                <span
                  key={i}
                  className="w-2 h-2 border border-wharf-border-primary"
                  style={{ backgroundColor: color }}
                />
              ))}
            </span>
            {selectedTheme.name} ]
          </span>
        )}
      </div>
    </div>
  );
};
