import { Download, GitBranch, Settings } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  repoData?: {
    name: string;
    owner: string;
    language: string;
    stars: number;
    forks: number;
  };
}

interface Persona {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface ChatHeaderProps {
  session?: ChatSession | null;
  onExport: () => void;
  selectedPersona?: string;
  personas?: Persona[];
  onPersonaChange?: (id: string) => void;
}

export const ChatHeader = ({
  session,
  onExport,
  selectedPersona = 'developer',
  personas = [],
  onPersonaChange,
}: ChatHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b-2 border-wharf-border-secondary bg-wharf-surface-secondary">
      <div className="flex items-center gap-3">
        <h1 className="font-display font-black text-xl tracking-tighter">
          WHARF <span className="text-wharf-pink">Chat</span>
        </h1>
        {session?.repoData && (
          <>
            <div className="w-px h-6 bg-wharf-border-secondary" />
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-wharf-text-tertiary" />
              <span className="font-mono text-sm font-bold">
                {session.repoData.owner}/{session.repoData.name}
              </span>
              <Badge variant="cyan" size="sm">
                {session.repoData.language}
              </Badge>
              <Badge variant="pink" size="sm">
                {session.repoData.stars}⭐
              </Badge>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-1.5 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:border-wharf-border-primary hover:bg-wharf-surface-primary transition-colors"
        >
          <Download className="w-3 h-3" />
          Export
        </button>

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1.5 border-2 border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-primary transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-48 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal">
              {/* Persona Section */}
              <div className="p-2 border-b-2 border-wharf-border-secondary">
                <span className="font-mono text-[9px] font-bold text-wharf-text-tertiary uppercase tracking-wider block mb-1.5">
                  Persona
                </span>
                <div className="space-y-1">
                  {personas.map((persona) => {
                    const isActive = selectedPersona === persona.id;
                    const Icon = persona.icon;

                    return (
                      <button
                        key={persona.id}
                        onClick={() => {
                          if (onPersonaChange) onPersonaChange(persona.id);
                          setIsSettingsOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-2 px-2 py-1.5 border transition-colors
                          ${
                            isActive
                              ? `border-wharf-border-primary bg-wharf-${persona.color}`
                              : 'border-transparent hover:border-wharf-border-secondary hover:bg-wharf-surface-secondary'
                          }
                        `}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 ${isActive ? 'text-wharf-black' : 'text-wharf-text-tertiary'}`}
                        />
                        <span
                          className={`font-mono text-[10px] font-bold ${isActive ? 'text-wharf-black' : 'text-wharf-text-secondary'}`}
                        >
                          {persona.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Persona Display */}
              {selectedPersonaData && (
                <div className="p-2">
                  <div className="flex items-center gap-2 px-2 py-1 border border-wharf-border-secondary bg-wharf-surface-secondary">
                    <selectedPersonaData.icon className="w-3 h-3 text-wharf-text-tertiary" />
                    <span className="font-mono text-[9px] text-wharf-text-tertiary">
                      Active: <span className="font-bold">{selectedPersonaData.label}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
