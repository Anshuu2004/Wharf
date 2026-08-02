import { User, Key, BarChart3, Settings, AlertTriangle, type LucideIcon } from 'lucide-react';

interface SettingsNavProps {
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
  borderColor: string;
}

const tabConfig: Record<string, TabConfigItem> = {
  profile: {
    id: 'profile',
    label: 'Profile',
    icon: User,
    activeBg: 'bg-wharf-pink/20',
    hoverBg: 'hover:bg-wharf-pink/20',
    activeText: 'text-wharf-pink-darker',
    borderColor: 'border-wharf-pink/40',
  },
  apikeys: {
    id: 'apikeys',
    label: 'API Keys',
    icon: Key,
    activeBg: 'bg-wharf-purple/20',
    hoverBg: 'hover:bg-wharf-purple/20',
    activeText: 'text-wharf-purple-darker',
    borderColor: 'border-wharf-purple/40',
  },
  usage: {
    id: 'usage',
    label: 'Usage',
    icon: BarChart3,
    activeBg: 'bg-wharf-cyan/20',
    hoverBg: 'hover:bg-wharf-cyan/20',
    activeText: 'text-wharf-cyan-darker',
    borderColor: 'border-wharf-cyan/40',
  },
  preferences: {
    id: 'preferences',
    label: 'Preferences',
    icon: Settings,
    activeBg: 'bg-wharf-yellow/20',
    hoverBg: 'hover:bg-wharf-yellow/20',
    activeText: 'text-wharf-yellow-darker',
    borderColor: 'border-wharf-yellow/40',
  },
  danger: {
    id: 'danger',
    label: 'Danger Zone',
    icon: AlertTriangle,
    activeBg: 'bg-wharf-error/20',
    hoverBg: 'hover:bg-wharf-error/20',
    activeText: 'text-wharf-error',
    borderColor: 'border-wharf-error/40',
  },
};

export const SettingsNav = ({ activeTab, onTabChange }: SettingsNavProps) => {
  const tabs = Object.values(tabConfig);

  return (
    <div className="w-full bg-wharf-surface-primary border-2 border-wharf-border-primary py-3 px-2 sm:px-4 shadow-brutal-sm rounded-xl overflow-x-auto">
      <div className="grid grid-cols-5 gap-3 sm:gap-4 w-full min-w-[280px]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const config = tab;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex items-center justify-center gap-2.5 px-2 py-3
                font-mono text-sm font-bold transition-all duration-300 rounded-md cursor-pointer
                ${
                  isActive
                    ? `${config.activeBg} ${config.activeText} border border-wharf-border-primary shadow-brutal-sm`
                    : `text-wharf-text-secondary ${config.hoverBg} hover:text-wharf-text-primary border border-wharf-border-primary hover:shadow-brutal-sm`
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
