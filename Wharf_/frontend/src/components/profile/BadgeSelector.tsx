import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { Badge } from '../ui/Badge'

interface BadgeSelectorProps {
  techStack: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

const availableBadges = [
  { id: 'stars', label: '⭐ GitHub Stars' },
  { id: 'followers', label: '👥 Followers' },
  { id: 'contributions', label: '📊 Contributions' },
  { id: 'languages', label: '🖥️ Top Languages' },
  { id: 'streak', label: '🔥 Streak' },
  { id: 'visitors', label: '👀 Profile Views' },
]

export const BadgeSelector = ({ techStack, selected, onChange }: BadgeSelectorProps) => {
  const [showAll, setShowAll] = useState(false)

  const toggleBadge = (badgeId: string) => {
    if (selected.includes(badgeId)) {
      onChange(selected.filter(id => id !== badgeId))
    } else {
      onChange([...selected, badgeId])
    }
  }

  // Get tech stack badges (auto-detected)
  const techBadges = techStack.map(tech => ({
    id: `tech-${tech.toLowerCase()}`,
    label: tech,
    isTech: true
  }))

  const allBadges = [...techBadges, ...availableBadges]

  const displayBadges = showAll ? allBadges : allBadges.slice(0, 6)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider">Badges</span>
          <Badge variant="ghost" size="sm">{selected.length} selected</Badge>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="font-mono text-[10px] text-wharf-pink hover:underline"
        >
          {showAll ? 'Show less' : 'Show all'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => {
          const isSelected = selected.includes(badge.id)
          return (
            <button
              key={badge.id}
              onClick={() => toggleBadge(badge.id)}
              className={`
                group flex items-center gap-1.5 px-2 py-1 border transition-all duration-200
                ${isSelected 
                  ? 'border-wharf-border-primary bg-wharf-pink' 
                  : 'border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-secondary'
                }
              `}
            >
              {isSelected ? (
                <Check className="w-3 h-3" />
              ) : (
                <Plus className="w-3 h-3 text-wharf-text-tertiary group-hover:text-wharf-text-primary" />
              )}
              <span className="font-mono text-[10px] font-bold">
                {badge.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}