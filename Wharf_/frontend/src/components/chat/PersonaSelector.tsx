import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(false)
  const selectedPersona = personas.find(p => p.id === selected)
  const Icon = selectedPersona?.icon

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 border-2 transition-all ${
          isOpen 
            ? 'border-wharf-border-primary bg-wharf-pink shadow-brutal-sm' 
            : 'border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-secondary'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="font-mono text-[10px] font-bold whitespace-nowrap">
          {selectedPersona?.label || 'Persona'}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal">
          {personas.map((persona) => {
            const isActive = selected === persona.id
            const PersonaIcon = persona.icon
            
            return (
              <button
                key={persona.id}
                onClick={() => {
                  onChange(persona.id)
                  setIsOpen(false)
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 border-b border-wharf-border-secondary last:border-b-0 transition-colors
                  ${isActive ? 'bg-wharf-pink' : 'hover:bg-wharf-surface-secondary'}
                `}
              >
                <PersonaIcon className={`w-3.5 h-3.5 ${isActive ? 'text-wharf-black' : 'text-wharf-text-tertiary'}`} />
                <span className={`font-mono text-[10px] font-bold ${isActive ? 'text-wharf-black' : 'text-wharf-text-secondary'}`}>
                  {persona.label}
                </span>
                {isActive && <Check className="w-3 h-3 ml-auto" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}