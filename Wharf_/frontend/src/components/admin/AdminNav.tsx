import { LayoutDashboard, BarChart3, Activity, Terminal, type LucideIcon } from 'lucide-react';

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

interface TabConfigItem {
  id: string;
  label: string;
  icon: LucideIcon;
  activeBg: string;
  hoverBg: string;
  activeText: string;
}

const tabConfig: Record<string, TabConfigItem> = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    activeBg: 'bg-wharf-pink/20',
    hoverBg: 'hover:bg-wharf-pink/20',
    activeText: 'text-wharf-pink-darker',
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    activeBg: 'bg-wharf-purple/20',
    hoverBg: 'hover:bg-wharf-purple/20',
    activeText: 'text-wharf-purple-darker',
  },
  metrics: {
    id: 'metrics',
    label: 'Metrics',
    icon: Activity,
    activeBg: 'bg-wharf-cyan/20',
    hoverBg: 'hover:bg-wharf-cyan/20',
    activeText: 'text-wharf-cyan-darker',
  },
  logs: {
    id: 'logs',
    label: 'Logs',
    icon: Terminal,
    activeBg: 'bg-wharf-yellow/20',
    hoverBg: 'hover:bg-wharf-yellow/20',
    activeText: 'text-wharf-yellow-darker',
  },
};

export const AdminNav = ({ activeTab, onTabChange }: AdminNavProps) => {
  const tabs = Object.values(tabConfig);

  return (
    <div className="w-full bg-wharf-surface-primary border-2 border-wharf-border-primary py-3 px-4 shadow-brutal-sm rounded-xl">
      <div className="grid grid-cols-4 gap-4 w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center justify-center gap-2.5 px-2 py-3
                font-mono text-sm font-bold transition-all duration-300 rounded-md cursor-pointer
                ${
                  isActive
                    ? `${tab.activeBg} ${tab.activeText} border border-wharf-border-primary shadow-brutal-sm`
                    : `text-wharf-text-secondary ${tab.hoverBg} hover:text-wharf-text-primary border border-wharf-border-primary hover:shadow-brutal-sm`
                }
              `}
            >
              <Icon
                className={`w-4 h-4 transition-all duration-300 ${
                  isActive ? '' : 'text-wharf-text-secondary'
                }`}
              />
              <span className="hidden sm:inline tracking-wider font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
