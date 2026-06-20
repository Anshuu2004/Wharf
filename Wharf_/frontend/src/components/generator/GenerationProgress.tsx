import { Sparkles, FileText, GitBranch, CheckCircle2, Loader2, Clock, Zap, Rocket } from 'lucide-react'
import { Card } from '../ui/Card'

interface Step {
  id: string
  label: string
  icon: React.ElementType
  description?: string
}

const steps: Step[] = [
  { 
    id: 'analyzing', 
    label: 'Analyzing repository structure', 
    icon: GitBranch,
    description: 'Scanning your codebase and dependencies'
  },
  { 
    id: 'generating', 
    label: 'Generating documentation', 
    icon: Sparkles,
    description: 'Creating comprehensive README content'
  },
  { 
    id: 'formatting', 
    label: 'Formatting markdown', 
    icon: FileText,
    description: 'Applying professional styling and structure'
  },
]

interface GenerationProgressProps {
  progress?: number
  currentStep?: number
  isComplete?: boolean
  estimatedTime?: string
}

export const GenerationProgress = ({ 
  progress = 0,
  currentStep = 0,
  isComplete = false,
  estimatedTime = '~2 minutes'
}: GenerationProgressProps) => {
  const activeStep = Math.min(currentStep, steps.length - 1)
  const isFinished = progress >= 100 || isComplete

  return (
    <Card variant="hard" className="relative overflow-hidden border-4 border-wharf-border-primary">
      {/* Background */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-wharf-teal via-wharf-cyan to-wharf-green" />
      
      <div className="relative p-6 text-center">
        {/* Status Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            {/* Outer Ring */}
            <div className={`
              w-20 h-20 rounded-full border-4 border-wharf-border-primary 
              flex items-center justify-center
              ${isFinished ? 'bg-wharf-green' : 'bg-wharf-surface-secondary'}
              transition-all duration-500
            `}>
              {isFinished ? (
                <CheckCircle2 className="w-10 h-10 text-wharf-text-primary" />
              ) : (
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-wharf-text-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-wharf-teal rounded-full animate-pulse" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Pulsing Ring Effect */}
            {!isFinished && (
              <>
                <div className="absolute inset-0 rounded-full border-4 border-wharf-teal animate-ping opacity-30" />
                <div className="absolute inset-0 rounded-full border-4 border-wharf-cyan animate-pulse opacity-20" style={{ animationDelay: '0.5s' }} />
              </>
            )}
          </div>
        </div>

        {/* Title & Progress */}
        <h3 className="font-display font-black text-2xl tracking-tight mb-1">
          {isFinished ? '✨ README Ready!' : 'Generating Your README'}
        </h3>
        
        {!isFinished && (
          <p className="font-mono text-sm text-wharf-text-tertiary mb-3 capitalize">
            Please wait while we craft your documentation
          </p>
        )}

        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="max-w-xs mx-auto mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-mono text-xs font-bold text-wharf-text-secondary">
                Progress
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-wharf-text-primary">
                  {Math.round(progress)}%
                </span>
                {!isFinished && (
                  <span className="font-mono text-[10px] text-wharf-text-tertiary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {estimatedTime}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full h-4 border-2 border-wharf-border-primary bg-wharf-surface-secondary overflow-hidden">
              <div 
                className={`
                  h-full bg-gradient-to-r from-wharf-teal via-wharf-cyan to-wharf-green 
                  transition-all duration-700 ease-out
                  ${isFinished ? 'w-full' : ''}
                `}
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                {/* Animated Shimmer Effect */}
                {!isFinished && progress < 100 && (
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-2.5 w-full max-w-sm mx-auto">
          {steps.map((step, index) => {
            const isActive = index === activeStep && !isFinished
            const isCompleted = index < activeStep || isFinished
            const Icon = step.icon
            
            return (
              <div 
                key={step.id} 
                className={`
                  flex items-center gap-3 p-3 border-2 transition-all duration-300
                  ${isCompleted ? 'border-wharf-green bg-wharf-green/10' : ''}
                  ${isActive ? 'border-wharf-teal bg-wharf-cyan/20 shadow-brutal-sm' : ''}
                  ${!isCompleted && !isActive ? 'border-wharf-border-secondary hover:border-wharf-border-primary' : ''}
                `}
              >
                {/* Step Indicator */}
                <div className={`
                  w-8 h-8 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0
                  ${isCompleted ? 'bg-wharf-green' : ''}
                  ${isActive ? 'bg-wharf-teal animate-pulse' : ''}
                  ${!isCompleted && !isActive ? 'bg-wharf-surface-secondary' : ''}
                  transition-all duration-300
                `}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-wharf-text-primary" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-wharf-text-primary animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-wharf-text-tertiary" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`
                      font-mono font-bold text-sm
                      ${isCompleted ? 'text-wharf-text-primary' : ''}
                      ${isActive ? 'text-wharf-text-primary' : ''}
                      ${!isCompleted && !isActive ? 'text-wharf-text-tertiary' : ''}
                    `}>
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="font-mono text-[10px] text-wharf-green font-bold uppercase tracking-wider">
                        ✓ Done
                      </span>
                    )}
                    {isActive && (
                      <span className="font-mono text-[10px] text-wharf-teal font-bold uppercase tracking-wider animate-pulse">
                        ● In progress
                      </span>
                    )}
                  </div>
                  {step.description && (
                    <p className={`
                      font-mono text-[10px] mt-0.5
                      ${isCompleted || isActive ? 'text-wharf-text-secondary' : 'text-wharf-text-tertiary'}
                    `}>
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Step Number */}
                <span className="font-mono text-[10px] text-wharf-text-tertiary">
                  {index + 1}/{steps.length}
                </span>
              </div>
            )
          })}
        </div>

        {/* Completion Actions */}
        {isFinished && (
          <div className="mt-6 pt-6 border-t-2 border-wharf-border-secondary">
            <div className="flex items-center justify-center gap-2">
              <Rocket className="w-4 h-4 text-wharf-teal" />
              <span className="font-mono text-sm font-bold text-wharf-text-primary capitalize">
                Documentation ready to use!
              </span>
            </div>
            <p className="font-mono text-xs text-wharf-text-tertiary mt-1 capitalize">
              Your README has been generated successfully
            </p>
          </div>
        )}

        {/* Time Estimate For Completion */}
        {!isFinished && progress > 0 && progress < 100 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-wharf-yellow" />
            <span className="font-mono text-[10px] text-wharf-text-tertiary capitalize">
              Optimizing content for your audience...
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}