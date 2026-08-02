import { Download, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Persona {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface ChatHeaderProps {
  onExport: () => void;
  selectedPersona?: string;
  personas?: Persona[];
  onPersonaChange?: (id: string) => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const ChatHeader = ({
  onExport,
  selectedPersona = 'developer',
  personas = [],
  onPersonaChange,
  isSidebarOpen = false,
  onToggleSidebar,
}: ChatHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);

  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 border-b-2 border-wharf-border-secondary bg-wharf-surface-secondary">
      {/* Left: Sidebar Toggle On Mobile */}
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-pink transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <h1 className="hidden sm:block font-display font-black text-xl tracking-tighter uppercase">
          WHARF <span className="text-wharf-pink-dark">Chat</span>
        </h1>
      </div>

      {/* Right: Export, Settings, and Mobile Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-2 border-2 border-wharf-border-primary font-mono text-xs font-bold hover:bg-wharf-surface-primary transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-1 px-2.5 py-1.75 border-2 border-wharf-border-primary font-mono text-xs font-bold hover:border-wharf-border-primary hover:bg-wharf-surface-primary transition-colors cursor-pointer"
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
