import {
  GitBranch,
  FileText,
  Settings2,
  Users,
  Tag,
  Plus,
  Minus,
  TrendingUp,
  Bug,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Hash,
  Zap,
} from 'lucide-react';
import { Card, Badge } from '../ui';
import { useState } from 'react';

interface Stats {
  totalCommits: number;
  contributors: number;
  tags: number;
  commitsByType: {
    feat: number;
    fix: number;
    refactor: number;
    breaking: number;
    chore: number;
  };
}

interface ChangelogOptions {
  commitCount: number;
  includeTags: boolean;
  includeContributors: boolean;
  format: 'keep-a-changelog' | 'simple' | 'json';
  groupByType: boolean;
}

interface ChangelogOptionsProps {
  options: ChangelogOptions;
  onChange: (options: ChangelogOptions) => void;
  stats?: Stats;
}

export const ChangelogOptions = ({ options, onChange, stats }: ChangelogOptionsProps) => {
  const maxCommits = Math.min(stats?.totalCommits || 500, 500);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(options.commitCount.toString());

  const handleIncrement = () => {
    if (options.commitCount < maxCommits) {
      onChange({ ...options, commitCount: options.commitCount + 1 });
    }
  };

  const handleDecrement = () => {
    if (options.commitCount > 1) {
      onChange({ ...options, commitCount: options.commitCount - 1 });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempValue(value);
  };

  const handleInputBlur = () => {
    let value = parseInt(tempValue);
    if (isNaN(value) || value < 1) value = 1;
    if (value > maxCommits) value = maxCommits;
    onChange({ ...options, commitCount: value });
    setTempValue(value.toString());
    setIsEditing(false);
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setTempValue(options.commitCount.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setTempValue(options.commitCount.toString());
    }
  };

  const formatTypes = [
    {
      id: 'keep-a-changelog' as const,
      label: 'Keep a Changelog',
      icon: FileText,
      description: 'Standard format with version sections',
    },
    {
      id: 'simple' as const,
      label: 'Simple',
      icon: Zap,
      description: 'Clean, minimal format',
    },
    {
      id: 'json' as const,
      label: 'JSON',
      icon: Hash,
      description: 'Machine-readable format',
    },
  ];

  const commitTypes = [
    { key: 'feat', label: 'Features', icon: TrendingUp, color: 'green-darker' },
    { key: 'fix', label: 'Fixes', icon: Bug, color: 'orange-darker' },
    { key: 'refactor', label: 'Refactors', icon: RefreshCw, color: 'cyan-darker' },
    { key: 'breaking', label: 'Breaking', icon: AlertTriangle, color: 'error' },
    { key: 'chore', label: 'Chores', icon: CheckCircle, color: 'purple-darker' },
  ] as const;

  const progress = (options.commitCount / maxCommits) * 100;

  return (
    <div className="space-y-8">
      {/* Stats Preview */}
      {stats && (
        <Card variant="hard" rounded="2xl" className="p-5 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-wharf-cyan/30">
                <GitBranch className="w-4 h-4 text-wharf-cyan-darker" />
              </div>
              <span className="font-mono font-bold text-sm uppercase tracking-wide">
                Repository Statistics
              </span>
            </div>
            <Badge variant="default" size="sm" className="hidden md:flex gap-1">
              <Users className="w-3 h-3" />
              {stats.contributors} contributors
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Commits */}
            <div className="p-3 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-xl text-center">
              <div className="mb-1 font-display font-black text-2xl text-wharf-text-primary">
                {stats.totalCommits >= 500 ? '500+' : stats.totalCommits}
              </div>
              <div className="font-mono text-[10px] text-wharf-text-secondary flex items-center justify-center gap-1.5">
                <GitBranch className="w-3 h-3" />
                Commits
              </div>
            </div>

            {/* Contributors */}
            <div className="p-3 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-xl text-center">
              <div className="mb-1 font-display font-black text-2xl text-wharf-text-primary">
                {stats.contributors}
              </div>
              <div className="font-mono text-[10px] text-wharf-text-secondary flex items-center justify-center gap-1.5">
                <Users className="w-3 h-3" />
                Contributors
              </div>
            </div>

            {/* Tags */}
            <div className="p-3 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-xl text-center">
              <div className="mb-1 font-display font-black text-2xl text-wharf-text-primary">
                {stats.tags}
              </div>
              <div className="font-mono text-[10px] text-wharf-text-secondary flex items-center justify-center gap-1.5">
                <Tag className="w-3 h-3" />
                Tags
              </div>
            </div>

            {/* Commit Type Breakdown */}
            {commitTypes.map((type) => {
              const count = stats.commitsByType[type.key as keyof typeof stats.commitsByType] || 0;
              return (
                <div
                  key={type.key}
                  className="p-3 bg-wharf-surface-secondary border border-wharf-border-secondary rounded-xl text-center"
                >
                  <div className={`mb-1 font-display font-black text-xl text-wharf-${type.color}`}>
                    {count}
                  </div>
                  <div className="font-mono text-[10px] text-wharf-text-secondary flex items-center justify-center gap-1.5">
                    <type.icon className="w-3 h-3" />
                    {type.label}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Commit Count */}
      <Card variant="hard" rounded="2xl" className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-1 rounded-lg bg-wharf-cyan/30">
                <GitBranch className="w-4 h-4 text-wharf-cyan-darker" />
              </div>
              <h4 className="font-mono font-bold text-sm uppercase tracking-wide">Commit Count</h4>
            </div>
            <p className="mt-1.5 font-mono text-xs text-wharf-text-secondary capitalize">
              Select the number of commits to include
            </p>
          </div>

          <div className="flex items-center gap-12">
            {/* Progress Indicator */}
            <div className="hidden sm:block w-48">
              <div className="flex justify-between font-mono text-[10px] text-wharf-text-secondary mb-1">
                <span>1</span>
                <span>{maxCommits}</span>
              </div>
              <div className="h-1.5 w-full bg-wharf-border-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-wharf-cyan-dark transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Counter */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                disabled={options.commitCount <= 1}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  options.commitCount <= 1
                    ? 'border-wharf-border-secondary text-wharf-text-tertiary/40 cursor-not-allowed'
                    : 'border-wharf-border-secondary hover:border-wharf-cyan hover:bg-wharf-cyan/10 text-wharf-text-secondary hover:text-wharf-cyan'
                }`}
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative">
                <input
                  type="text"
                  value={isEditing ? tempValue : options.commitCount}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onKeyDown={handleKeyDown}
                  className="w-20 px-3 py-2 text-center font-display font-black text-xl border-2 border-wharf-border-primary rounded-xl bg-wharf-surface-primary focus:border-wharf-cyan focus:ring-2 focus:ring-wharf-cyan/20 outline-none transition-all"
                />
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 font-mono text-[10px] text-wharf-text-secondary whitespace-nowrap">
                  / {maxCommits}
                </div>
              </div>

              <button
                onClick={handleIncrement}
                disabled={options.commitCount >= maxCommits}
                className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                  options.commitCount >= maxCommits
                    ? 'border-wharf-border-secondary text-wharf-text-tertiary/40 cursor-not-allowed'
                    : 'border-wharf-border-secondary hover:border-wharf-cyan hover:bg-wharf-cyan/10 text-wharf-text-secondary hover:text-wharf-cyan'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-4 border-t border-wharf-border-secondary">
          <span className="font-mono text-[10px] text-wharf-text-secondary uppercase tracking-wide">
            Quick select:
          </span>
          {[10, 50, 100].map((num) => (
            <button
              key={num}
              onClick={() => {
                const value = Math.min(num, maxCommits);
                onChange({ ...options, commitCount: value });
              }}
              className={`px-3 py-1 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                options.commitCount === Math.min(num, maxCommits)
                  ? 'border-wharf-cyan-dark bg-wharf-cyan/10 text-wharf-cyan-darker'
                  : 'border-wharf-border-secondary hover:border-wharf-cyan-dark text-wharf-text-secondary hover:text-wharf-cyan-darker'
              }`}
              disabled={num > maxCommits}
            >
              {num}
            </button>
          ))}
          {maxCommits > 100 && (
            <button
              onClick={() => {
                onChange({ ...options, commitCount: maxCommits });
              }}
              className={`px-3 py-1 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                options.commitCount === maxCommits
                  ? 'border-wharf-cyan bg-wharf-cyan/10 text-wharf-cyan'
                  : 'border-wharf-border-secondary hover:border-wharf-cyan-dark text-wharf-text-secondary hover:text-wharf-cyan-darker'
              }`}
            >
              <span className="md:hidden">All</span>
              <span className="hidden md:block">All ({maxCommits})</span>
            </button>
          )}
        </div>
      </Card>

      {/* Format Selection */}
      <Card variant="hard" rounded="2xl" className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1 rounded-lg bg-wharf-purple/30">
            <FileText className="w-4 h-4 text-wharf-purple-darker" />
          </div>
          <h4 className="font-mono font-bold text-sm uppercase tracking-wide">Format</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {formatTypes.map((format) => {
            const isSelected = options.format === format.id;
            const IconComponent = format.icon;

            return (
              <button
                key={format.id}
                onClick={() => onChange({ ...options, format: format.id })}
                className={`group p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-wharf-purple-dark bg-wharf-purple/30 ring-2 ring-wharf-purple/20'
                    : 'border-wharf-border-secondary hover:border-wharf-purple-dark hover:bg-wharf-purple/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors bg-wharf-surface-tertiary/70`}
                  >
                    <IconComponent className={`w-4 h-4 text-wharf-text-secondary`} />
                  </div>
                  <span
                    className={`font-mono text-sm font-bold transition-colors text-wharf-text-primary capitalize`}
                  >
                    {format.label}
                  </span>
                </div>
                <p className="font-mono text-xs text-wharf-text-secondary pl-10 capitalize">
                  {format.description}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Options Toggles */}
      <Card variant="hard" rounded="2xl" className="p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-1 rounded-lg bg-wharf-green/30">
            <Settings2 className="w-4 h-4 text-wharf-green-darker" />
          </div>
          <h4 className="font-mono font-bold text-sm uppercase tracking-wide">Options</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              id: 'includeTags' as const,
              label: 'Include Tags',
              icon: Tag,
              description: 'Add version tags',
            },
            {
              id: 'includeContributors' as const,
              label: 'Include Contributors',
              icon: Users,
              description: 'List contributors',
            },
            {
              id: 'groupByType' as const,
              label: 'Group by Type',
              icon: Settings2,
              description: 'Organize commits by type',
            },
          ].map((toggle) => {
            const isChecked = options[toggle.id];
            const IconComponent = toggle.icon;

            return (
              <label
                key={toggle.id}
                className={`group p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  isChecked
                    ? 'border-wharf-green-dark bg-wharf-green/10'
                    : 'border-wharf-border-secondary hover:border-wharf-green-dark hover:bg-wharf-green/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => onChange({ ...options, [toggle.id]: e.target.checked })}
                    className="w-4 h-4 border-2 border-wharf-border-primary accent-wharf-green-dark cursor-pointer"
                  />
                  <div
                    className={`p-1.5 rounded-lg transition-colors bg-wharf-surface-tertiary/70`}
                  >
                    <IconComponent className={`w-4 h-4 text-wharf-text-secondary`} />
                  </div>
                  <div className="flex-1">
                    <span
                      className={`font-mono text-sm font-bold transition-colors text-wharf-text-primary`}
                    >
                      {toggle.label}
                    </span>
                    <p className="font-mono text-xs text-wharf-text-secondary capitalize">
                      {toggle.description}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-wharf-cyan-darker" />
            <span className="font-mono text-sm font-bold text-wharf-text-secondary">
              {options.commitCount} Commits
            </span>
          </div>
          <span className="hidden md:block h-5 w-0.5 bg-wharf-text-secondary"></span>
          {options.includeTags && (
            <Badge variant="default" size="sm" className="gap-1 hidden md:flex">
              <Tag className="w-3 h-3" />
              Tags
            </Badge>
          )}
          {options.includeContributors && (
            <Badge variant="default" size="sm" className="gap-1 hidden md:flex">
              <Users className="w-3 h-3" />
              Contributors
            </Badge>
          )}
          {options.groupByType && (
            <Badge variant="default" size="sm" className="gap-1 hidden md:flex">
              <Settings2 className="w-3 h-3" />
              Grouped
            </Badge>
          )}
        </div>
        <Badge variant="pink" size="sm" className="gap-1">
          <FileText className="w-3 h-3" />
          {formatTypes.find((f) => f.id === options.format)?.label || 'Format'}
        </Badge>
      </div>
    </div>
  );
};

