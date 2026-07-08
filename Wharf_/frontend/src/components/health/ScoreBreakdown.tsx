import { motion } from 'framer-motion';
import { Card, Badge } from '../ui';
import {
  BarChart3,
  TrendingUp,
  FileText,
  Package,
  Zap,
  Wrench,
  Handshake,
  FileCheck,
  Palette,
} from 'lucide-react';

interface ScoreBreakdownProps {
  breakdown: {
    description: number;
    installation: number;
    usage: number;
    techStack: number;
    contributing: number;
    license: number;
    visuals: number;
  };
}

const categories = [
  { id: 'description', label: 'Description', max: 20, icon: FileText },
  { id: 'installation', label: 'Installation', max: 20, icon: Package },
  { id: 'usage', label: 'Usage', max: 15, icon: Zap },
  { id: 'techStack', label: 'Tech Stack', max: 15, icon: Wrench },
  { id: 'contributing', label: 'Contributing', max: 15, icon: Handshake },
  { id: 'license', label: 'License', max: 10, icon: FileCheck },
  { id: 'visuals', label: 'Visuals', max: 5, icon: Palette },
];

export const ScoreBreakdown = ({ breakdown }: ScoreBreakdownProps) => {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const getColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-wharf-green-darker';
    if (percentage >= 60) return 'bg-wharf-orange-dark';
    if (percentage >= 40) return 'bg-wharf-yellow';
    return 'bg-wharf-error';
  };

  // Get Color For Icon
  const getIconColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-wharf-green-darker';
    if (percentage >= 60) return 'text-wharf-orange-dark';
    if (percentage >= 40) return 'text-wharf-yellow';
    return 'text-wharf-error';
  };

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-wharf-border-secondary/30">
            <BarChart3 className="w-4 h-4 text-wharf-text-secondary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-wharf-text-primary">Score Breakdown</h3>
            <p className="font-mono text-xs text-wharf-text-secondary">
              {total} / 100 total points
            </p>
          </div>
        </div>
        <Badge variant="green" size="sm">
          {total}%
        </Badge>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const score = breakdown[cat.id as keyof typeof breakdown] || 0;
          const percentage = (score / cat.max) * 100;
          const Icon = cat.icon;
          const iconColor = getIconColor(score, cat.max);

          return (
            <div key={cat.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${iconColor} bg-wharf-border-secondary/30`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-sm font-medium text-wharf-text-primary">
                    {cat.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-wharf-text-secondary">
                    {score}/{cat.max}
                  </span>
                  <Badge variant="default" size="sm">
                    {Math.round(percentage)}%
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-wharf-border-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${getColor(score, cat.max)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              {/* Missing Points */}
              {score < cat.max && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
                    Missing {cat.max - score} point{cat.max - score !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="mt-6 pt-4 border-t border-wharf-border-secondary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-wharf-green-darker" />
              <span className="font-mono text-[10px] text-wharf-text-secondary">Excellent</span>
            </div>{' '}
            <span className="text-wharf-text-tertiary/80">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-wharf-orange-dark" />
              <span className="font-mono text-[10px] text-wharf-text-secondary">Good</span>
            </div>{' '}
            <span className="text-wharf-text-tertiary/80">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-wharf-yellow" />
              <span className="font-mono text-[10px] text-wharf-text-secondary">Fair</span>
            </div>{' '}
            <span className="text-wharf-text-tertiary/80">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-wharf-error" />
              <span className="font-mono text-[10px] text-wharf-text-secondary">Needs Work</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-wharf-text-secondary">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">Overall Score</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
