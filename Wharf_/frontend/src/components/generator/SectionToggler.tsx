import { Check } from 'lucide-react'

const sections = [
  { id: 'description', name: 'Description', default: true },
  { id: 'installation', name: 'Installation', default: true },
  { id: 'usage', name: 'Usage', default: true },
  { id: 'tech-stack', name: 'Tech Stack', default: true },
  { id: 'features', name: 'Features', default: false },
  { id: 'api-reference', name: 'API Reference', default: false },
  { id: 'contributing', name: 'Contributing', default: true },
  { id: 'license', name: 'License', default: true },
]

interface SectionTogglerProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export const SectionToggler = ({ selected, onChange }: SectionTogglerProps) => {
  const toggleSection = (sectionId: string) => {
    if (selected.includes(sectionId)) {
      onChange(selected.filter(id => id !== sectionId))
    } else {
      onChange([...selected, sectionId])
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => toggleSection(section.id)}
          className={`flex items-center gap-2 px-3 py-2 border-2 transition-all ${
            selected.includes(section.id)
              ? 'bg-wharf-pink border-wharf-border-primary'
              : 'border-wharf-border-secondary hover:border-wharf-border-primary'
          }`}
        >
          {selected.includes(section.id) && <Check className="w-3 h-3" />}
          <span className="font-mono text-xs font-bold">{section.name}</span>
        </button>
      ))}
    </div>
  )
}