import { Users, Code, GraduationCap, Zap, Check, Target, Leaf } from 'lucide-react';

interface ToneSelectorProps {
  value: 'technical' | 'recruiter' | 'beginner';
  onChange: (tone: 'technical' | 'recruiter' | 'beginner') => void;
}

const tones = [
  {
    id: 'technical',
    name: 'Technical',
    icon: Code,
    description: 'For developers & contributors',
    color: 'border-wharf-cyan',
    bgColor: 'bg-gradient-to-br from-wharf-cyan to-wharf-cyan-darker',
    hoverColor: 'hover:border-wharf-cyan',
    badge: Zap,
    details: 'Code examples, API docs, architecture',
  },
  {
    id: 'recruiter',
    name: 'Recruiter-Ready',
    icon: Users,
    description: 'For hiring managers & portfolios',
    color: 'border-wharf-purple',
    bgColor: 'bg-gradient-to-br from-wharf-purple to-wharf-purple-darker',
    hoverColor: 'hover:border-wharf-purple',
    badge: Target,
    details: 'Impact-focused, problem solved, metrics',
  },
  {
    id: 'beginner',
    name: 'Beginner-Friendly',
    icon: GraduationCap,
    description: 'For open-source newcomers',
    color: 'border-wharf-green',
    bgColor: 'bg-gradient-to-br from-wharf-green to-wharf-green-darker',
    hoverColor: 'hover:border-wharf-green',
    badge: Leaf,
    details: 'Step-by-step, welcoming, accessible',
  },
];

export const ToneSelector = ({ value, onChange }: ToneSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
      {tones.map((tone) => {
        const isActive = value === tone.id;
        const BadgeIcon = tone.badge;

        return (
          <button
            key={tone.id}
            onClick={() => onChange(tone.id as 'technical' | 'recruiter' | 'beginner')}
            className={`
              group relative p-4 text-left border-2 transition-all duration-300
              ${
                isActive
                  ? `${tone.bgColor} border-wharf-border-primary shadow-brutal-sm`
                  : `border-wharf-border-primary hover:bg-wharf-surface-secondary hover:shadow-brutal-sm`
              }
            `}
          >
            {/* Badge Icon */}
            <div className="absolute -top-2 -right-2 w-5 h-5 border-3 border-wharf-border-primary bg-wharf-surface-primary flex items-center justify-center">
              {isActive ? (
                <Check className="w-3 h-3 text-wharf-black" />
              ) : (
                <BadgeIcon className="w-3 h-3 text-wharf-text-tertiary" />
              )}
            </div>

            {/* Icon */}
            <div
              className={`
              w-10 h-10 border-2 border-wharf-border-primary shadow-brutal-sm flex items-center justify-center mb-3
              ${isActive ? 'bg-wharf-surface-primary' : 'bg-wharf-surface-secondary group-hover:bg-wharf-surface-primary'}
              transition-all duration-300
            `}
            >
              <tone.icon
                className={`w-5 h-5 ${isActive ? 'text-wharf-text-primary' : 'text-wharf-text-secondary group-hover:text-wharf-text-primary'}`}
              />
            </div>

            {/* Content */}
            <div className="font-mono font-bold text-sm">{tone.name}</div>
            <div className="font-mono text-xs text-wharf-text-secondary mt-1 capitalize">
              {tone.description}
            </div>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-wharf-border-primary" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-wharf-surface-primary font-mono text-[10px] text-wharf-text-secondary capitalize">
                  {tone.details}
                </span>
              </div>
            </div>

            {/* Active Indicator Bar */}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-1 bg-wharf-black" />}
          </button>
        );
      })}
    </div>
  );
};
