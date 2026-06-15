import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { PageWrapper } from '../components/layout'
import { 
  RepoImportSection, 
  GeneratorOptions, 
  GenerationProgress,
  ReadmePreview,
  ExportActions
} from '../components/generator'
import { Tabs } from '../components/ui/Tabs'
import type { TabItem } from '../components/ui/Tabs'

// Define proper types
interface RepoData {
  url: string
  owner: string
  repo: string
  description: string
  stars: number
  forks: number
  language: string
  framework: string[]
}

interface GeneratorOptionsType {
  tone: 'technical' | 'recruiter' | 'beginner'
  sections: string[]
}

export const GeneratorPage = () => {
  const { user } = useAuthStore()
  const [selectedRepo, setSelectedRepo] = useState<RepoData | null>(null)
  const [generatedReadme, setGeneratedReadme] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  // Remove unused activeTab state
  const [options, setOptions] = useState<GeneratorOptionsType>({
    tone: 'recruiter',
    sections: ['description', 'installation', 'usage', 'tech-stack', 'contributing', 'license']
  })

  const [currentStep, setCurrentStep] = useState(1)

  const handleGenerate = async () => {
    if (!selectedRepo) return
    
    setIsGenerating(true)
    setGeneratedReadme('')
    setCurrentStep(3)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/generate/readme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token || ''}`
        },
        body: JSON.stringify({
          repoUrl: selectedRepo.url,
          tone: options.tone,
          sections: options.sections
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start README generation')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder('utf-8')
      if (!reader) return

      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        buffer = lines.pop() || ''

        for (const line of lines) {
          const cleanLine = line.trim()
          if (!cleanLine.startsWith('data: ')) continue
          
          const dataStr = cleanLine.slice(6)
          if (dataStr === '[DONE]') break

          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.error) {
              console.error(parsed.error)
              alert(parsed.error)
              break
            }
            if (parsed.text) {
              setGeneratedReadme((prev) => prev + parsed.text)
            }
          } catch (e) {
            // Partial JSON
          }
        }
      }
      
      // Auto move to export if done and text exists? We'll let the user choose that.
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const tabs: TabItem[] = [
    {
      id: 'preview',
      label: 'Preview',
      content: <ReadmePreview content={generatedReadme} />
    }
  ]

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  return (
    <PageWrapper 
      title="README Generator" 
      description="Create professional documentation for any GitHub repository"
    >
      <div className="max-w-8xl mx-auto space-y-8">
        
        {/* Wizard Progress Bar */}
        <div className="flex items-center justify-between border-b-2 border-wharf-border-secondary pb-4">
          {[
            { step: 1, label: '1. Select Repo' },
            { step: 2, label: '2. Options' },
            { step: 3, label: '3. Generate' },
            { step: 4, label: '4. Export' }
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => {
                // Ensure users cannot skip ahead if they don't have the prerequisites
                if (s.step > 1 && !selectedRepo) return;
                if (s.step > 3 && !generatedReadme) return;
                setCurrentStep(s.step)
              }}
              className={`font-mono text-sm uppercase transition-colors ${
                currentStep === s.step 
                  ? 'text-wharf-pink border-b-2 border-wharf-pink' 
                  : 'text-wharf-text-tertiary hover:text-wharf-text-secondary'
              } ${
                (s.step > 1 && !selectedRepo) || (s.step > 3 && !generatedReadme) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Step Views */}
        <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal p-6">
          
          {currentStep === 1 && (
            <div className="space-y-6">
              <RepoImportSection 
                user={user}
                onRepoSelect={(repo) => {
                  setSelectedRepo(repo)
                  setCurrentStep(2) // Move to step 2 automatically
                }}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              {selectedRepo ? (
                <>
                  <GeneratorOptions 
                    options={options}
                    onChange={setOptions}
                    onGenerate={handleGenerate}
                    isGenerating={isGenerating}
                  />
                  <div className="flex justify-between mt-6 pt-4 border-t border-wharf-border-secondary">
                    <button onClick={prevStep} className="wharf-btn-secondary">Back</button>
                    <button 
                      onClick={handleGenerate} 
                      className="wharf-btn font-bold text-wharf-bg bg-wharf-pink px-6 py-2"
                    >
                      Start Generating
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center font-mono py-8">Please select a repository first.</div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              {isGenerating && <GenerationProgress />}
              {generatedReadme && !isGenerating && (
                 <>
                   <Tabs tabs={tabs} defaultTabId="preview" />
                   <div className="flex justify-between mt-6 pt-4 border-t border-wharf-border-secondary">
                     <button onClick={prevStep} className="wharf-btn-secondary">Back</button>
                     <button 
                       onClick={() => setCurrentStep(4)} 
                       className="wharf-btn font-bold text-wharf-bg bg-wharf-pink px-6 py-2"
                     >
                       Next: Export
                     </button>
                   </div>
                 </>
              )}
              {generatedReadme && isGenerating && (
                <Tabs tabs={tabs} defaultTabId="preview" />
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              {generatedReadme ? (
                <>
                   <ExportActions content={generatedReadme} repoName={selectedRepo?.repo} />
                   <div className="flex justify-start mt-6 pt-4 border-t border-wharf-border-secondary">
                     <button onClick={prevStep} className="wharf-btn-secondary">Back to Preview</button>
                   </div>
                </>
              ) : (
                <div className="text-center font-mono py-8">Generate a README first.</div>
              )}
            </div>
          )}
          
        </div>
      </div>
    </PageWrapper>
  )
}