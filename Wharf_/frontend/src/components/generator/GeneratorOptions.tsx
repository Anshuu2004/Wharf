import { Zap } from 'lucide-react'
import { Button, Card } from '../ui'
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
  onGenerate, 
  isGenerating 
}: GeneratorOptionsProps) => {
  return (
    <Card variant="hard" className="space-y-6">
      <div>
        <h3 className="font-display font-black text-lg mb-4">Documentation Tone</h3>
        <ToneSelector 
          value={options.tone} 
          onChange={(tone) => onChange({ ...options, tone })} 
        />
      </div>

      <div>
        <h3 className="font-display font-black text-lg mb-4">Include Sections</h3>
        <SectionToggler 
          selected={options.sections} 
          onChange={(sections) => onChange({ ...options, sections })} 
        />
      </div>

      <Button 
        variant="primary" 
        size="lg" 
        fullWidth 
        onClick={onGenerate}
        loading={isGenerating}
        icon={<Zap className="w-4 h-4" />}
      >
        Generate Documentation
      </Button>
    </Card>
  )
}