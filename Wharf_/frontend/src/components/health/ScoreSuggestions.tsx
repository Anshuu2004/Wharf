import { CheckCircle, Lightbulb, Star, Zap, GitPullRequest } from 'lucide-react';
import { Card, Badge } from '../ui';
import { motion } from 'framer-motion';

interface ScoreSuggestionsProps {
  suggestions: string[];
  type?: 'readme' | 'contribution';
  className?: string;
}

export const ScoreSuggestions = ({
  suggestions,
  type = 'readme',
  className = '',
}: ScoreSuggestionsProps) => {
  const isReadme = type === 'readme';

  const config = isReadme
    ? {
        title: 'README Improvements',
        icon: Lightbulb,
        color: 'cyan',
        colorDark: 'wharf-cyan-dark',
        emptyTitle: 'All Good!',
        emptyMessage: 'Your README is well-structured & comprehensive. Great job!',
        badgeLabel: 'README',
      }
    : {
        title: 'Contribution Readiness',
        icon: GitPullRequest,
        color: 'purple',
        colorDark: 'wharf-purple-dark',
        emptyTitle: 'Perfect!',
        emptyMessage: 'Your contribution guidelines are clear & well-organized.',
        badgeLabel: 'Contributing',
      };

  const colorClass = config.color;
  const colorDark = config.colorDark;
  const Icon = config.icon;

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card
        variant="hard"
        rounded="3xl"
        className={`p-8 text-center h-full flex items-center justify-center ${className}`}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center py-6"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-wharf-green/15 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-wharf-green-dark" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-wharf-green-dark flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Star className="w-3 h-3 text-white" />
            </motion.div>
          </div>
          <h4 className="font-display font-bold text-xl text-wharf-text-primary mb-1">
            {config.emptyTitle}
          </h4>
          <p className="font-mono text-sm text-wharf-text-secondary max-w-xs">
            {config.emptyMessage}
          </p>
          <div className="mt-4 flex items-center gap-2 text-wharf-text-tertiary">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">Ready To Publish</span>
          </div>
        </motion.div>
      </Card>
    );
  }

  // Priority Levels
  const getPriority = (index: number) => {
    if (index < 2) return { label: 'High', color: 'text-wharf-error' };
    if (index < 4) return { label: 'Medium', color: 'text-wharf-orange-darker' };
    return { label: 'Low', color: 'text-wharf-text-secondary' };
  };

  return (
    <Card
      variant="hard"
      rounded="3xl"
      className={`overflow-hidden p-6 relative h-full flex flex-col ${className}`}
    >
      {/* Gradient Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${isReadme ? 'from-wharf-cyan via-wharf-blue to-wharf-cyan' : 'from-wharf-purple via-wharf-green to-wharf-purple'} opacity-60`}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-1 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl bg-wharf-${colorClass}/10 border border-wharf-${colorClass}/30`}
          >
            <Icon className={`w-4 h-4 ${colorDark}`} />
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm text-wharf-text-primary">
              {config.title}
            </h4>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-wharf-text-secondary">
                {suggestions.length} Recommendations
              </span>
            </div>
          </div>
        </div>
        <Badge variant={colorClass as 'cyan' | 'purple'} size="sm" className="hidden sm:block font-mono">
          {config.badgeLabel}
        </Badge>
      </div>

      {/* Suggestions */}
      <div className="flex-grow overflow-y-auto space-y-3 min-h-[200px] max-h-[400px] pr-1 scrollbar-hidden">
        {suggestions.map((suggestion, idx) => {
          const priority = getPriority(idx);
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="group"
            >
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-all duration-200 border border-wharf-border-primary">
                {/* Suggestion Number */}
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-6 h-6 rounded-lg bg-wharf-${colorClass}/10 flex items-center justify-center border border-wharf-${colorClass}/30`}
                  >
                    <span className="font-mono text-[10px] font-bold text-wharf-text-primary">
                      {idx + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm text-wharf-text-primary leading-relaxed">
                    {suggestion}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className={`font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border border-${priority.color}/30 ${priority.color}`}
                    >
                      {priority.label} Priority
                    </span>
                    {idx === 0 && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-wharf-yellow/15 border border-wharf-yellow-darker">
                        <Star className="w-2.5 h-2.5 text-wharf-yellow-darker fill-wharf-yellow" />
                        <span className="font-mono text-[10px] text-wharf-yellow-darker font-medium">
                          Top Pick
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};

