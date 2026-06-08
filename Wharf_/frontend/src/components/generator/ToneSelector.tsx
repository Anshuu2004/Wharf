import { Users, Code, GraduationCap } from 'lucide-react'

interface ToneSelectorProps {
  value: 'technical' | 'recruiter' | 'beginner'
  onChange: (tone: 'technical' | 'recruiter' | 'beginner') => void
}

const tones = [
  {
    id: 'technical',
    name: 'Technical',
    icon: Code,
    description: 'For developers and contributors',
    color: 'border-wharf-cyan'
  },
  {
    id: 'recruiter',
    name: 'Recruiter-Ready',
    icon: Users,
    description: 'For hiring managers and portfolios',
    color: 'border-wharf-pink'
  },
  {
    id: 'beginner',
    name: 'Beginner-Friendly',
    icon: GraduationCap,
    description: 'For open-source newcomers',
    color: 'border-wharf-green'
  }
]

export const ToneSelector = ({ value, onChange }: ToneSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {tones.map((tone) => (
        <button
          key={tone.id}
          onChange={() => onChange(tone.id as 'technical' | 'recruiter' | 'beginner')}
          className={`p-4 text-left border-2 transition-all ${
            value === tone.id
              ? `bg-${tone.id === 'technical' ? 'wharf-cyan' : tone.id === 'recruiter' ? 'wharf-pink' : 'wharf-green'} border-wharf-border-primary shadow-brutal-sm`
              : 'border-wharf-border-secondary hover:border-wharf-border-primary'
          }`}
        >
          <tone.icon className="w-5 h-5 mb-2" />
          <div className="font-mono font-bold text-sm">{tone.name}</div>
          <div className="font-mono text-xs text-wharf-text-tertiary mt-1">{tone.description}</div>
        </button>
      ))}
    </div>
  )
}