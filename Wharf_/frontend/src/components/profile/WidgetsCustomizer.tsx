import { Check, Trophy, Flame, BarChart2, Star, Eye, Users } from 'lucide-react'

interface WidgetsCustomizerProps {
  options: {
    githubBadges: string[];
    showStats: boolean;
    showTopLanguages: boolean;
    showContributions: boolean;
    showStreak: boolean;
    showTrophies: boolean;
  }
  onChange: (options: any) => void
}

export const WidgetsCustomizer = ({ options, onChange }: WidgetsCustomizerProps) => {

  const toggleBadge = (badge: string) => {
    const newBadges = options.githubBadges.includes(badge)
      ? options.githubBadges.filter(b => b !== badge)
      : [...options.githubBadges, badge]
    onChange({ ...options, githubBadges: newBadges })
  }

  const toggleOption = (key: keyof typeof options) => {
    onChange({ ...options, [key]: !options[key as keyof typeof options] })
  }

  const badges = [
    { id: 'stars', name: 'Total Stars', icon: Star },
    { id: 'followers', name: 'Followers', icon: Users },
    { id: 'views', name: 'Profile Views', icon: Eye }
  ]

  const widgets = [
    { id: 'showStats', name: 'GitHub Stats Card', icon: BarChart2 },
    { id: 'showTopLanguages', name: 'Top Languages', icon: BarChart2 },
    { id: 'showStreak', name: 'Contribution Streak', icon: Flame },
    { id: 'showTrophies', name: 'GitHub Trophies', icon: Trophy }
  ]

  return (
    <div className="space-y-6">
      
      <div>
        <h4 className="font-mono font-bold text-sm mb-3">Top GitHub Badges</h4>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => {
            const isSelected = options.githubBadges.includes(badge.id);
            const Icon = badge.icon;
            return (
              <button
                key={badge.id}
                onClick={() => toggleBadge(badge.id)}
                className={`
                  group relative flex items-center justify-between gap-2 px-3 py-2.5 border-2 transition-all duration-200
                  ${isSelected ? 'bg-wharf-pink border-wharf-border-primary shadow-brutal-sm' : 'border-wharf-border-primary hover:shadow-brutal-sm hover:bg-wharf-surface-secondary'}
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-wharf-black" />
                  <span className="font-mono text-xs font-bold leading-tight">{badge.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="font-mono font-bold text-sm mb-3">Dynamic Widgets</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {widgets.map((widget) => {
            const isSelected = options[widget.id as keyof typeof options];
            const Icon = widget.icon;
            return (
              <button
                key={widget.id}
                onClick={() => toggleOption(widget.id as any)}
                className={`
                  group relative flex items-center justify-between gap-2 px-3 py-2.5 border-2 transition-all duration-200
                  ${isSelected ? 'bg-wharf-cyan border-wharf-border-primary shadow-brutal-sm' : 'border-wharf-border-primary hover:shadow-brutal-sm hover:bg-wharf-surface-secondary'}
                `}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-wharf-black" />
                  <span className="font-mono text-xs font-bold leading-tight">{widget.name}</span>
                </div>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
