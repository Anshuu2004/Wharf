import {
  Check,
  Trophy,
  Flame,
  BarChart2,
  Star,
  Eye,
  Users,
  Zap,
  Code,
  TrendingUp,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useState } from 'react';

// Define Option Types
interface WidgetsCustomizerOptions {
  githubBadges: string[];
  showStats: boolean;
  showTopLanguages: boolean;
  showContributions: boolean;
  showStreak: boolean;
  showTrophies: boolean;
}

interface WidgetsCustomizerProps {
  options: WidgetsCustomizerOptions;
  onChange: (options: WidgetsCustomizerOptions) => void;
}

// Define Widget & Badge Types
interface BadgeItem {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
}

interface WidgetItem {
  id: keyof WidgetsCustomizerOptions;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
}

export const WidgetsCustomizer = ({ options, onChange }: WidgetsCustomizerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleBadge = (badge: string) => {
    const newBadges = options.githubBadges.includes(badge)
      ? options.githubBadges.filter((b) => b !== badge)
      : [...options.githubBadges, badge];
    onChange({ ...options, githubBadges: newBadges });
  };

  const toggleOption = (key: keyof WidgetsCustomizerOptions) => {
    onChange({ ...options, [key]: !options[key] });
  };

  const badges: BadgeItem[] = [
    {
      id: 'stars',
      name: 'Total Stars',
      icon: Star,
      description: 'Show your total stars count',
      color: 'text-wharf-yellow-darker',
      bgColor: 'bg-wharf-yellow/20',
    },
    {
      id: 'followers',
      name: 'Followers',
      icon: Users,
      description: 'Display your followers',
      color: 'text-wharf-cyan-darker',
      bgColor: 'bg-wharf-cyan/20',
    },
    {
      id: 'views',
      name: 'Profile Views',
      icon: Eye,
      description: 'Show profile view count',
      color: 'text-wharf-purple-darker',
      bgColor: 'bg-wharf-purple/20',
    },
  ];

  const widgets: WidgetItem[] = [
    {
      id: 'showStats',
      name: 'GitHub Stats',
      icon: BarChart2,
      description: 'Display comprehensive stats card',
      color: 'text-wharf-teal-darker',
      bgColor: 'bg-wharf-teal/20',
    },
    {
      id: 'showTopLanguages',
      name: 'Top Languages',
      icon: Code,
      description: 'Show language breakdown',
      color: 'text-wharf-purple-darker',
      bgColor: 'bg-wharf-purple/20',
    },
    {
      id: 'showStreak',
      name: 'Contribution Streak',
      icon: Flame,
      description: 'Display your current streak',
      color: 'text-wharf-orange-darker',
      bgColor: 'bg-wharf-orange/20',
    },
    {
      id: 'showTrophies',
      name: 'GitHub Trophies',
      icon: Trophy,
      description: 'Show achievement trophies',
      color: 'text-wharf-yellow-darker',
      bgColor: 'bg-wharf-yellow/20',
    },
    {
      id: 'showContributions',
      name: 'Contributions',
      icon: TrendingUp,
      description: 'Show contribution graph',
      color: 'text-wharf-green-darker',
      bgColor: 'bg-wharf-green/20',
    },
  ];

  // Filter Items
  const filteredBadges = badges.filter(
    (badge) =>
      badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWidgets = widgets.filter(
    (widget) =>
      widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSelectedBadges = options.githubBadges.length;
  const totalSelectedWidgets = [
    options.showStats,
    options.showTopLanguages,
    options.showStreak,
    options.showTrophies,
    options.showContributions,
  ].filter(Boolean).length;
  const totalSelected = totalSelectedBadges + totalSelectedWidgets;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search widgets and badges..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 pl-9 border-2 border-wharf-border-primary bg-wharf-surface-primary font-mono text-sm outline-none focus:shadow-brutal-sm transition-shadow rounded-xl"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-wharf-text-tertiary hover:text-wharf-text-primary transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* GitHub Badges Section */}
      <div className="space-y-3 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center">
              <FaGithub className="w-3.5 h-3.5 text-wharf-text-primary" />
            </div>
            <span className="font-mono text-sm font-bold text-wharf-text-primary uppercase tracking-wider">
              GitHub Badges
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const isSelected = options.githubBadges.includes(badge.id);
            const Icon = badge.icon;

            return (
              <button
                key={badge.id}
                onClick={() => toggleBadge(badge.id)}
                className={`
                  group relative flex items-center gap-3 p-3.5 border-2 transition-all duration-200 text-left rounded-xl cursor-pointer
                  ${
                    isSelected
                      ? `${badge.bgColor} border-wharf-border-primary shadow-brutal-sm -translate-y-0.5`
                      : 'border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-secondary hover:-translate-y-0.5'
                  }
                `}
              >
                <div
                  className={`
                  w-10 h-10 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-wharf-surface-primary' : 'bg-wharf-surface-secondary group-hover:bg-wharf-surface-primary'}
                  transition-colors
                `}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? badge.color : 'text-wharf-text-tertiary'}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isSelected ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
                      }`}
                    >
                      {badge.name}
                    </span>
                    {isSelected && (
                      <div className="w-3 h-3 border border-wharf-border-primary bg-wharf-text-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-wharf-surface-primary" />
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-wharf-text-secondary block capitalize">
                    {badge.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Widgets Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-wharf-border-primary bg-wharf-surface-secondary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-wharf-teal" />
            </div>
            <span className="font-mono text-sm font-bold text-wharf-text-primary uppercase tracking-wider">
              Dynamic Widgets
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredWidgets.map((widget) => {
            const isSelected = options[widget.id] as boolean;
            const Icon = widget.icon;

            return (
              <button
                key={widget.id}
                onClick={() => toggleOption(widget.id)}
                className={`
                  group relative flex items-center gap-3 p-3.5 border-2 transition-all duration-200 text-left rounded-xl cursor-pointer
                  ${
                    isSelected
                      ? `${widget.bgColor} border-wharf-border-primary shadow-brutal-sm -translate-y-0.5`
                      : 'border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-secondary hover:-translate-y-0.5'
                  }
                `}
              >
                <div
                  className={`
                  w-10 h-10 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-wharf-surface-primary' : 'bg-wharf-surface-secondary group-hover:bg-wharf-surface-primary'}
                  transition-colors
                `}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? widget.color : 'text-wharf-text-tertiary'}`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-sm font-bold ${
                        isSelected ? 'text-wharf-text-primary' : 'text-wharf-text-secondary'
                      }`}
                    >
                      {widget.name}
                    </span>
                    {isSelected && (
                      <div className="w-3 h-3 border border-wharf-border-primary bg-wharf-text-primary flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-wharf-surface-primary" />
                      </div>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-wharf-text-secondary block capitalize">
                    {widget.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="pt-4 border-t-2 border-wharf-border-secondary flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[10px] font-mono text-wharf-text-secondary">
          <span className="flex items-center gap-1 capitalize">
            <Check className="w-3 h-3 text-wharf-green-darker" />
            {totalSelected} features selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Select All Badges
              const allBadgeIds = badges.map((b) => b.id);
              const newOptions: WidgetsCustomizerOptions = {
                ...options,
                githubBadges: allBadgeIds,
              };
              // Select All Widgets
              newOptions.showStats = true;
              newOptions.showTopLanguages = true;
              newOptions.showStreak = true;
              newOptions.showTrophies = true;
              newOptions.showContributions = true;
              onChange(newOptions);
            }}
            className="px-3 py-1.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary rounded-lg transition-colors font-mono text-[10px] font-bold cursor-pointer"
          >
            Select All
          </button>
          <button
            onClick={() => {
              // Deselect All
              const newOptions: WidgetsCustomizerOptions = {
                ...options,
                githubBadges: [],
              };
              // Deselect All Widgets
              newOptions.showStats = false;
              newOptions.showTopLanguages = false;
              newOptions.showStreak = false;
              newOptions.showTrophies = false;
              newOptions.showContributions = false;
              onChange(newOptions);
            }}
            className="px-3 py-1.5 border-2 border-wharf-border-secondary bg-wharf-surface-primary hover:bg-wharf-error/10 hover:border-wharf-error transition-colors font-mono text-[10px] font-bold text-wharf-text-tertiary hover:text-wharf-error cursor-pointer rounded-lg"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
