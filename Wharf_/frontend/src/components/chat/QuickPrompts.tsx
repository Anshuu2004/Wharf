import { Zap, Code, Users, Shield, Lightbulb, Rocket, Search } from 'lucide-react';

const quickPrompts = [
  {
    label: 'What does this do?',
    icon: Search,
    prompt: 'Explain what this project does in simple terms',
  },
  {
    label: 'How to run it?',
    icon: Rocket,
    prompt: 'Give me step-by-step instructions to run this project locally',
  },
  {
    label: 'Architecture',
    icon: Code,
    prompt: 'Explain the architecture and design patterns used in this project',
  },
  {
    label: 'Tech Stack',
    icon: Zap,
    prompt: 'What technologies, frameworks, and libraries are used?',
  },
  {
    label: 'Improvements',
    icon: Lightbulb,
    prompt: 'What improvements would you suggest for this project?',
  },
  {
    label: 'Interview Prep',
    icon: Users,
    prompt: 'Generate 5 interview questions about this codebase',
  },
  {
    label: 'Security',
    icon: Shield,
    prompt: 'Are there any security vulnerabilities in this codebase?',
  },
];

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export const QuickPrompts = ({ onSelect }: QuickPromptsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-wharf-pink-dark" />
        <span className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider">
          Quick Prompts
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((item) => (
          <button
            key={item.label}
            onClick={() => onSelect(item.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-pink-dark hover:bg-wharf-pink/5 transition-colors"
          >
            <item.icon className="w-3 h-3 text-wharf-text-tertiary" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
