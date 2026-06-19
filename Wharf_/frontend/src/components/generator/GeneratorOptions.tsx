import { Zap, Layout, TrendingUp } from 'lucide-react'
import { Card } from '../ui'
import { ToneSelector, SectionToggler } from '../generator'

interface GeneratorOptionsProps {
  options: {
    tone: 'technical' | 'recruiter' | 'beginner'
    sections: string[]
  }
  onChange: (options: any) => void
  onGenerate: () => void
  isGenerating: boolean
}

export const GeneratorOptions = ({ 
  options, 
  onChange, 
  // onGenerate, 
  isGenerating 
}: GeneratorOptionsProps) => {
  const selectedCount = options.sections.length
  const totalSections = 10
  const progress = (selectedCount / totalSections) * 100

  return (
    <Card variant="hard" className="space-y-6 overflow-hidden">
      {/* Header */}
      <div className="relative -m-6 mb-0 p-6 bg-gradient-to-r from-wharf-surface-secondary to-wharf-surface-primary border-b-2 border-wharf-border-primary">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-xl tracking-tighter flex items-center gap-2">
              Documentation Options
            </h3>
            <p className="font-mono text-sm text-wharf-text-secondary mt-1 capitalize">
              Customize your README structure
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-wharf-text-primary">
                {selectedCount}
              </span>
              <span className="font-mono text-xs text-wharf-text-tertiary">/{totalSections}</span>
            </div>
            <div className="w-20 h-2 border border-wharf-border-primary bg-wharf-surface-primary overflow-hidden">
              <div 
                className="h-full bg-wharf-text-secondary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tone Selection */}
        <div>
          <div className="flex items-center gap-2 mt-6 mb-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-wharf-purple-darker" />
            </div>
            <h4 className="font-mono font-bold text-sm uppercase tracking-wider text-wharf-text-secondary">
              Tone | Choose your audience
            </h4>
          </div>
          <ToneSelector 
            value={options.tone} 
            onChange={(tone) => onChange({ ...options, tone })} 
          />
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-wharf-border-primary" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-wharf-surface-primary font-mono text-[10px] text-wharf-text-primary">
              SECTIONS
            </span>
          </div>
        </div>

        {/* Section Toggler */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 flex items-center justify-center">
              <Layout className="w-3.5 h-3.5 text-wharf-teal" />
            </div>
            <h4 className="font-mono font-bold text-sm uppercase tracking-wider text-wharf-text-secondary capitalize">
              Include Sections | Select what to include
            </h4>
          </div>
          <SectionToggler 
            selected={options.sections} 
            onChange={(sections) => onChange({ ...options, sections })} 
          />
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          {/* <Button 
            variant="gradient" 
            size="lg" 
            fullWidth 
            onClick={onGenerate}
            loading={isGenerating}
            className="group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Generate Documentation
                  <FileText className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button> */}
          
          {/* Progress Hint */}
          {!isGenerating && (
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-wharf-green-dark" />
                <span className="font-mono text-[12px] text-wharf-text-secondary capitalize">
                  {selectedCount} sections selected
                </span>
              </div>
              <div className="w-px h-4 bg-wharf-border-primary" />
              <span className="font-mono text-[12px] text-wharf-text-secondary capitalize">
                {options.tone} tone
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}