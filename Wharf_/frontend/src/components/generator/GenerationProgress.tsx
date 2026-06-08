import { Sparkles, FileText, GitBranch} from 'lucide-react'
import { Card } from '../ui/Card'

const steps = [
  { id: 'analyzing', label: 'Analyzing repository structure', icon: GitBranch },
  { id: 'generating', label: 'Generating documentation', icon: Sparkles },
  { id: 'formatting', label: 'Formatting markdown', icon: FileText },
]

export const GenerationProgress = () => {
  return (
    <Card variant="hard" className="text-center">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-wharf-border-primary rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-wharf-pink rounded-full animate-pulse" />
          </div>
          <div className="absolute inset-0 border-4 border-wharf-pink rounded-full animate-ping opacity-50" />
        </div>
        
        <h3 className="font-display font-black text-xl mb-4">Generating Your README</h3>
        
        <div className="space-y-3 w-full max-w-xs">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <step.icon className="w-4 h-4 text-wharf-pink animate-pulse" />
              <span className="font-mono text-sm">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}