import { Code, Terminal } from 'lucide-react';

interface TemplateSelectorProps {
  selected: string;
  onChange: (template: string) => void;
}

const templates = [
  {
    id: 'developer',
    name: 'Developer',
    icon: Code,
    description: 'Tech-focused',
    color: 'border-wharf-purple/40',
    textColor: 'text-wharf-purple-darker',
    hoverBg: 'hover:bg-wharf-purple/15',
    activeBg: 'bg-wharf-purple/25',
    badgeColor: 'purple',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    description: 'CLI-themed',
    color: 'border-wharf-orange/40',
    textColor: 'text-wharf-orange-darker',
    hoverBg: 'hover:bg-wharf-orange/15',
    activeBg: 'bg-wharf-orange/25',
    badgeColor: 'orange',
  },
];

export const TemplateSelector = ({ selected, onChange }: TemplateSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-8">
        {templates.map((template) => {
          const isActive = selected === template.id;
          const Icon = template.icon;

          return (
            <button
              key={template.id}
              onClick={() => onChange(template.id)}
              className={`
                group relative flex flex-col items-center p-4 border transition-all duration-200 cursor-pointer rounded-xl
                ${
                  isActive
                    ? `${template.activeBg} border-wharf-border-primary shadow-brutal-sm`
                    : `border-wharf-border-primary ${template.hoverBg} hover:shadow-brutal-sm`
                }
              `}
            >
              <Icon
                className={`w-5 h-5 mb-1.5 transition-colors ${
                  isActive
                    ? template.textColor
                    : 'text-wharf-text-tertiary group-hover:text-wharf-text-primary'
                }`}
              />

              <span
                className={`font-mono text-[13px] font-bold transition-colors ${
                  isActive
                    ? template.textColor
                    : 'text-wharf-text-primary  group-hover:text-wharf-text-primary'
                }`}
              >
                {template.name}
              </span>

              <span
                className={`font-mono text-[10px] transition- capitalize ${
                  isActive ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
                }`}
              >
                {template.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
