import {
  Check,
  BookOpen,
  Code2,
  FolderTree,
  GitBranch,
  FileText,
  Users,
  Layout,
  Scale,
  Zap,
} from 'lucide-react';

const sections = [
  { id: 'description', name: 'Description', icon: FileText, default: true },
  { id: 'installation', name: 'Installation', icon: Code2, default: true },
  { id: 'usage', name: 'Usage', icon: BookOpen, default: true },
  { id: 'tech-stack', name: 'Tech Stack', icon: Layout, default: true },
  { id: 'features', name: 'Features', icon: Zap, default: false },
  { id: 'api-reference', name: 'API Reference', icon: Code2, default: false },
  { id: 'project-structure', name: 'Project Structure', icon: FolderTree, default: false },
  { id: 'architecture', name: 'Architecture', icon: GitBranch, default: false },
  { id: 'contributing', name: 'Contributor Guidelines', icon: Users, default: true },
  { id: 'license', name: 'License', icon: Scale, default: true },
];

interface SectionTogglerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const SectionToggler = ({ selected, onChange }: SectionTogglerProps) => {
  const toggleSection = (sectionId: string) => {
    if (selected.includes(sectionId)) {
      onChange(selected.filter((id) => id !== sectionId));
    } else {
      onChange([...selected, sectionId]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {sections.map((section) => {
        const isSelected = selected.includes(section.id);
        const Icon = section.icon;

        return (
          <button
            key={section.id}
            onClick={() => toggleSection(section.id)}
            className={`
              group relative flex items-center gap-2 px-3 py-2.5 border-2 transition-all duration-200 rounded-lg cursor-pointer
              ${
                isSelected
                  ? 'bg-gradient-to-br from-wharf-yellow to-wharf-yellow-dark border-wharf-border-primary shadow-brutal-sm'
                  : 'border-wharf-border-primary hover:shadow-brutal-sm hover:bg-wharf-surface-tertiary'
              } 
            `}
          >
            {/* Selection Indicator */}
            {isSelected ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <Icon className="w-3.5 h-3.5 text-wharf-text-tertiary group-hover:text-wharf-text-primary flex-shrink-0" />
            )}

            <span className="font-mono text-[11px] font-bold leading-tight">{section.name}</span>

            {/* Default Badge */}
            {section.default && !isSelected && (
              <span className="absolute -top-1 -right-1 w-4 h-4 border border-wharf-border-primary bg-wharf-green-dark flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-wharf-black" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
