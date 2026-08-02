import { TrendingUp, TrendingDown, Minus, Award, Target, Clock } from 'lucide-react';
import { Card, Badge } from '../ui';
import { motion } from 'framer-motion';

interface HealthScoreCardProps {
  score: number;
  lastUpdated?: string;
  categoryCount?: number;
}

export const HealthScoreCard = ({
  score,
  lastUpdated,
  categoryCount = 7,
}: HealthScoreCardProps) => {
  const getScoreConfig = () => {
    if (score >= 80)
      return {
        color: 'green-darker',
        label: 'Excellent',
        icon: Award,
        description: 'Production-ready documentation',
      };
    if (score >= 60)
      return {
        color: 'orange-darker',
        label: 'Good',
        icon: TrendingUp,
        description: 'Solid foundation with room to grow',
      };
    if (score >= 40)
      return {
        color: 'yellow',
        label: 'Needs Work',
        icon: Minus,
        description: 'Missing key documentation sections',
      };
    return {
      color: 'error',
      label: 'Poor',
      icon: TrendingDown,
      description: 'Major improvements needed',
    };
  };

  const config = getScoreConfig();
  const Icon = config.icon;
  const circumference = 2 * Math.PI * 85;
  const offset = circumference * (1 - score / 100);

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Minimal Accent */}
      <div className={`w-12 h-1 rounded-full bg-wharf-${config.color} mb-4`} />

      <div className="flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 w-full mb-6">
          <div className="flex-1">
            <h3 className="font-mono font-bold text-md uppercase tracking-wider text-wharf-text-primary">
              README Health
            </h3>
            <p className="font-mono text-xs text-wharf-text-secondary capitalize">
              Documentation quality score
            </p>
          </div>
          <Badge variant="default" size="sm" className="hidden sm:flex items-center gap-1">
            <Target className="w-3 h-3" />
            {categoryCount} categories
          </Badge>
        </div>

        {/* Score Ring */}
        <div className="relative w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background */}
            <circle
              cx="96"
              cy="96"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-wharf-border-secondary"
            />
            {/* Progress */}
            <motion.circle
              cx="96"
              cy="96"
              r="85"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              className={`text-wharf-${config.color}`}
              style={{ strokeLinecap: 'round' }}
              animate={{ strokeDashoffset: offset }}
              initial={{ strokeDashoffset: circumference }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>

          {/* Score */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-display font-black text-5xl text-wharf-text-primary"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {score}
            </motion.span>
            <span className="font-mono text-xs text-wharf-text-secondary">/ 100</span>

            {/* Label */}
            <div className="flex items-center gap-1.5 mt-2">
              <Icon className={`w-3.5 h-3.5 text-wharf-${config.color}`} />
              <span className={`font-mono text-xs font-bold text-wharf-${config.color}`}>
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="font-mono text-sm text-wharf-text-secondary text-center mt-4 max-w-xs capitalize">
          {config.description}
        </p>

        {/* Footer */}
        {lastUpdated && (
          <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-wharf-border-secondary w-full justify-center">
            <Clock className="w-3 h-3 text-wharf-text-tertiary" />
            <span className="font-mono text-xs text-wharf-text-tertiary">
              Updated {lastUpdated}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
