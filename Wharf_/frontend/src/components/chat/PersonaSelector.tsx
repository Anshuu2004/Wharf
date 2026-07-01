import type { LucideIcon } from 'lucide-react'

interface Persona {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

interface PersonaSelectorProps {
  personas: Persona[]
  selected: string
  onChange: (id: string) => void
}

export const PersonaSelector = ({ personas, selected, onChange }: PersonaSelectorProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-[10px] font-bold text-wharf-text-secondary uppercase tracking-wider">
        Persona:
      </span>
      {personas.map((persona) => {
        const isActive = selected === persona.id
        const Icon = persona.icon
        
        return (
          <button
            key={persona.id}
            onClick={() => onChange(persona.id)}
            className={`
              flex items-center gap-2 px-4 py-1.5 border-2 transition-all
              ${isActive 
                ? `border-wharf-border-primary bg-wharf-${persona.color} shadow-brutal-sm` 
                : `border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-secondary`
              }
            `}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-wharf-black' : 'text-wharf-text-tertiary'}`} />
            <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-wharf-black' : 'text-wharf-text-secondary'}`}>
              {persona.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}   