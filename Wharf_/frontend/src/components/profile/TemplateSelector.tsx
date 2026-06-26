import { LayoutTemplate, Code, Palette, Terminal, Briefcase } from 'lucide-react'

interface TemplateSelectorProps {
  selected: string
  onChange: (template: string) => void
}

const templates = [
  { 
    id: 'minimal', 
    name: 'Minimal', 
    icon: LayoutTemplate,
    description: 'Clean & simple',
    color: 'border-wharf-cyan'
  },
  { 
    id: 'developer', 
    name: 'Developer', 
    icon: Code,
    description: 'Tech-focused',
    color: 'border-wharf-purple'
  },
  { 
    id: 'creative', 
    name: 'Creative', 
    icon: Palette,
    description: 'Visual & colorful',
    color: 'border-wharf-pink'
  },
  { 
    id: 'professional', 
    name: 'Professional', 
    icon: Briefcase,
    description: 'Corporate style',
    color: 'border-wharf-green'
  },
  { 
    id: 'terminal', 
    name: 'Terminal', 
    icon: Terminal,
    description: 'CLI-themed',
    color: 'border-wharf-orange'
  },
]

export const TemplateSelector = ({ selected, onChange }: TemplateSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {templates.map((template) => {
        const isActive = selected === template.id
        const Icon = template.icon
        
        return (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`
              group relative p-3 border-2 transition-all duration-200 text-center
              ${isActive 
                ? `${template.color} border-wharf-border-primary shadow-brutal-sm` 
                : 'border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-secondary'
              }
            `}
          >
            <Icon className={`w-5 h-5 mx-auto mb-2 transition-colors ${
              isActive ? 'text-wharf-text-primary' : 'text-wharf-text-tertiary group-hover:text-wharf-text-primary'
            }`} />
            <span className={`font-mono text-[10px] font-bold transition-colors ${
              isActive ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
            }`}>
              {template.name}
            </span>
            <span className="block font-mono text-[8px] text-wharf-text-tertiary mt-0.5">
              {template.description}
            </span>
            
            {isActive && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-wharf-black border border-wharf-border-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}