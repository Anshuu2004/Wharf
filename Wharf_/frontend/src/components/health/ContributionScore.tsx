import {
  Users,
  Check,
  X,
  AlertCircle,
  FileText,
  GitPullRequest,
  Heart,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Card, Badge } from '../ui';
import { motion } from 'framer-motion';

interface ContributionScoreProps {
  score: number;
  breakdown?: {
    hasContributing: boolean;
    hasIssueTemplates: boolean;
    hasPRTemplates: boolean;
    hasCodeOfConduct: boolean;
    hasGoodFirstIssues: boolean;
    hasCommunityLink: boolean;
  };
  suggestions: string[];
}

const checklistItems = [
  { id: 'hasContributing', label: 'CONTRIBUTING.md', icon: FileText },
  { id: 'hasIssueTemplates', label: 'Issue Templates', icon: AlertCircle },
  { id: 'hasPRTemplates', label: 'PR Templates', icon: GitPullRequest },
  { id: 'hasCodeOfConduct', label: 'Code of Conduct', icon: Heart },
  { id: 'hasGoodFirstIssues', label: 'Good First Issues', icon: Sparkles },
  { id: 'hasCommunityLink', label: 'Community Link', icon: MessageCircle },
];

export const ContributionScore = ({ score, breakdown }: ContributionScoreProps) => {
  const getScoreColor = () => {
    if (score >= 80) return 'green-darker';
    if (score >= 60) return 'orange-darker';
    if (score >= 40) return 'yellow';
    return 'error';
  };

  const color = getScoreColor();
  const completedCount = breakdown ? Object.values(breakdown).filter(Boolean).length : 0;
  const totalItems = checklistItems.length;

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden p-6">
      {/* Minimal Accent */}
      <div className={`w-12 h-1 rounded-full bg-wharf-${color} mb-4`} />

      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 w-full mb-6">
          <div className="flex-1">
            <h3 className="font-mono font-bold text-md uppercase tracking-wider text-wharf-text-primary">
              Contribution Readiness
            </h3>
            <p className="font-mono text-xs text-wharf-text-secondary capitalize">
              Community engagement score
            </p>
          </div>
          <Badge variant="default" size="sm" className="hidden sm:flex items-center gap-1">
            <Users className="w-3 h-3" />
            {completedCount}/{totalItems}
          </Badge>
        </div>

        {/* Score */}
        <div className="flex items-center gap-8 mb-6">
          {/* Circular Score */}
          <div className="relative flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-full bg-wharf-green/10 border-2 border-wharf-green-dark flex items-center justify-center`}
            >
              <span className={`text-2xl font-display font-black text-wharf-${color}`}>
                {score}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1">
            <div className="h-1.5 w-full bg-wharf-border-secondary rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-wharf-${color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px] text-wharf-text-tertiary">0</span>
              <span className="font-mono text-[10px] text-wharf-text-tertiary">100</span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        {breakdown && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {checklistItems.map((item) => {
              const hasItem = breakdown[item.id as keyof typeof breakdown];
              const IconComponent = item.icon;

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    hasItem
                      ? 'bg-wharf-green/20 border border-wharf-green-dark'
                      : 'bg-wharf-surface-secondary border border-wharf-border-primary'
                  }`}
                >
                  <div
                    className={`p-1 rounded ${
                      hasItem
                        ? 'bg-wharf-green/10 text-wharf-text-secondary'
                        : 'text-wharf-text-secondary'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`font-mono text-xs flex-1 ${
                      hasItem ? 'text-wharf-text-secondary' : 'text-wharf-text-tertiary'
                    }`}
                  >
                    {item.label}
                  </span>
                  {hasItem ? (
                    <Check className="w-3.5 h-3.5 text-wharf-green-darker" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-wharf-error" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
