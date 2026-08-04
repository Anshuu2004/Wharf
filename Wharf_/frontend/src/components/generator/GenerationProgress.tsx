import {
  FileText,
  GitBranch,
  CheckCircle2,
  Loader2,
  Zap,
  Rocket,
  Terminal,
  BookOpen,
  Code2,
  Layout,
} from 'lucide-react';
import { Card } from '../ui/Card';

interface Step {
  id: string;
  label: string;
  icon: React.ElementType;
  description?: string;
}

const steps: Step[] = [
  {
    id: 'analyzing',
    label: 'Analyzing repository structure',
    icon: GitBranch,
    description: 'Scanning your codebase and dependencies',
  },
  {
    id: 'generating',
    label: 'Generating documentation',
    icon: Zap,
    description: 'Creating comprehensive README content',
  },
  {
    id: 'formatting',
    label: 'Formatting markdown',
    icon: FileText,
    description: 'Applying professional styling and structure',
  },
];

interface GenerationProgressProps {
  progress?: number;
  currentStep?: number;
  isComplete?: boolean;
}

export const GenerationProgress = ({
  progress = 0,
  currentStep = 0,
  isComplete = false,
}: GenerationProgressProps) => {
  const activeStep = Math.min(currentStep, steps.length - 1);
  const isFinished = progress >= 100 || isComplete;

  return (
    <Card variant="hard" className="relative overflow-hidden border-4 border-wharf-border-primary rounded-2xl">
      {/* Progress Bar - Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-wharf-surface-secondary">
        <div
          className={`
            h-full bg-wharf-pink-darker
            transition-all duration-700 ease-out
            ${isFinished ? 'w-full' : ''}
          `}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="relative py-6 px-2 md:p-8 text-center">
        {/* Status Icon */}
        <div className="flex justify-center mb-5">
          <div
            className={`
              w-20 h-20 rounded-2xl border-4 border-wharf-border-primary 
              flex items-center justify-center
              ${isFinished ? 'bg-wharf-green/20 border-wharf-green' : 'bg-wharf-surface-secondary'}
              transition-all duration-500
            `}
          >
            {isFinished ? (
              <CheckCircle2 className="w-10 h-10 text-wharf-green" strokeWidth={2.5} />
            ) : (
              <Loader2 className="w-10 h-10 text-wharf-pink-darker animate-spin" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* Title & Progress */}
        <h3 className="font-display font-black text-2xl md:text-3xl tracking-tighter mb-1">
          {isFinished ? 'Documentation Ready!' : 'Generating Your README'}
        </h3>

        {!isFinished && (
          <p className="font-mono text-sm text-wharf-text-secondary mb-4 capitalize">
            Please wait while we craft your documentation
          </p>
        )}

        {/* Progress Bar with Stats */}
        {progress !== undefined && (
          <div className="max-w-xs mx-auto mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs font-bold text-wharf-text-secondary uppercase tracking-wider">
                Progress
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-wharf-text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <div className="w-full h-3 border-2 border-wharf-border-primary bg-wharf-surface-secondary overflow-hidden rounded-full">
              <div
                className={`
                  h-full bg-wharf-pink-darker
                  transition-all duration-700 ease-out rounded-full
                  ${isFinished ? 'w-full' : ''}
                `}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3 w-full max-w-md mx-auto">
          {steps.map((step, index) => {
            const isActive = index === activeStep && !isFinished;
            const isCompleted = index < activeStep || isFinished;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`
                  flex items-center gap-3 p-3 border-2 rounded-xl transition-all duration-300
                  ${isCompleted ? 'border-wharf-green bg-wharf-green/5' : ''}
                  ${isActive ? 'border-wharf-pink-darker bg-wharf-pink/10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : ''}
                  ${!isCompleted && !isActive ? 'border-wharf-border-secondary hover:border-wharf-border-primary' : ''}
                `}
              >
                {/* Step Indicator */}
                <div
                  className={`
                  w-9 h-9 border-2 border-wharf-border-primary rounded-lg flex items-center justify-center flex-shrink-0
                  ${isCompleted ? 'bg-wharf-green border-wharf-green' : ''}
                  ${isActive ? 'bg-wharf-pink-darker border-wharf-pink-darker' : ''}
                  ${!isCompleted && !isActive ? 'bg-wharf-surface-secondary' : ''}
                  transition-all duration-300
                `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-wharf-black" strokeWidth={2.5} />
                  ) : isActive ? (
                    <Loader2 className="w-4.5 h-4.5 text-wharf-black animate-spin" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-4.5 h-4.5 text-wharf-text-tertiary" strokeWidth={1.5} />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`
                      font-mono font-bold text-sm capitalize
                      ${isCompleted ? 'text-wharf-text-primary' : ''}
                      ${isActive ? 'text-wharf-text-primary' : ''}
                      ${!isCompleted && !isActive ? 'text-wharf-text-secondary' : ''}
                    `}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="font-mono text-[9px] text-wharf-green font-black uppercase tracking-wider bg-wharf-green/10 px-2 py-0.5 rounded-full">
                        Complete
                      </span>
                    )}
                    {isActive && (
                      <span className="font-mono text-[9px] text-wharf-pink-darker font-black uppercase tracking-wider bg-wharf-pink/10 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                    {!isCompleted && !isActive && (
                      <span className="font-mono text-[9px] text-wharf-text-tertiary uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p
                      className={`
                      font-mono text-[10px] mt-0.5
                      ${isCompleted || isActive ? 'text-wharf-text-secondary' : 'text-wharf-text-tertiary'}
                    `}
                    >
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Step Number */}
                <span className="font-mono text-[9px] text-wharf-text-tertiary font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Completion Actions */}
        {isFinished && (
          <div className="mt-6 pt-6 border-t-2 border-wharf-border-secondary">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-wharf-pink/10 border-2 border-wharf-pink-darker flex items-center justify-center">
                <Rocket className="w-4 h-4 text-wharf-pink-darker" />
              </div>
              <span className="font-mono text-sm font-bold text-wharf-text-primary capitalize">
                Documentation ready to use!
              </span>
            </div>
            <p className="font-mono text-xs text-wharf-text-tertiary mt-1.5 capitalize">
              Your README has been generated successfully
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <button className="font-mono text-[10px] text-wharf-text-tertiary hover:text-wharf-pink-darker transition-colors flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                View README
              </button>
              <span className="w-px h-3 bg-wharf-border-secondary" />
              <button className="font-mono text-[10px] text-wharf-text-tertiary hover:text-wharf-pink-darker transition-colors flex items-center gap-1.5">
                <Code2 className="w-3 h-3" />
                Copy Markdown
              </button>
              <span className="w-px h-3 bg-wharf-border-secondary" />
              <button className="font-mono text-[10px] text-wharf-text-tertiary hover:text-wharf-pink-darker transition-colors flex items-center gap-1.5">
                <Layout className="w-3 h-3" />
                Preview
              </button>
            </div>
          </div>
        )}

        {/* Current Status Message */}
        {!isFinished && progress > 0 && progress < 100 && (
          <div className="mt-4 flex items-center justify-center gap-2.5 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl px-4 py-2.5">
            <Terminal className="w-3.5 h-3.5 text-wharf-pink-darker" />
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              Processing your repository data...
            </span>
            <Zap className="w-3.5 h-3.5 text-yellow-500" />
          </div>
        )}

        {/* Initial State */}
        {!isFinished && progress === 0 && (
          <div className="mt-4 flex items-center justify-center gap-2.5 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl px-4 py-2.5">
            <Code2 className="w-3.5 h-3.5 text-wharf-pink-darker" />
            <span className="font-mono text-[10px] text-wharf-text-secondary capitalize">
              Preparing to analyze your repository
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};