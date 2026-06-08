import { useState } from 'react'
import { Link2, ArrowRight } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { Card, Button, Input } from '../ui'
import { RepoSelector } from './RepoSelector'
import api from '../../lib/api'

interface RepoImportSectionProps {
  user: any
  onRepoSelect: (repo: any) => void
}

export const RepoImportSection = ({ user, onRepoSelect }: RepoImportSectionProps) => {
  const [importMethod, setImportMethod] = useState<'url' | 'github'>('url')
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleUrlSubmit = async () => {
    if (!repoUrl) return
    
    setIsLoading(true)
    try {
      const response = await api.post('/repo/analyze', { repoUrl })
      if (response.data && response.data.success) {
        const analysis = response.data.data
        onRepoSelect({
          url: repoUrl,
          owner: analysis.meta.owner,
          repo: analysis.meta.name,
          description: analysis.meta.description || '',
          stars: analysis.meta.stars || 0,
          forks: analysis.meta.forks || 0,
          language: analysis.meta.language || '',
          framework: analysis.frameworks || []
        })
      }
    } catch (error) {
      console.error('Failed to analyze repository:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRepoSelect = async (repo: any) => {
    setIsLoading(true)
    const targetUrl = repo.url || `https://github.com/${repo.full_name}`
    try {
      const response = await api.post('/repo/analyze', { repoUrl: targetUrl })
      if (response.data && response.data.success) {
        const analysis = response.data.data
        onRepoSelect({
          url: targetUrl,
          owner: analysis.meta.owner,
          repo: analysis.meta.name,
          description: analysis.meta.description || '',
          stars: analysis.meta.stars || 0,
          forks: repo.forks || 0,
          language: analysis.meta.language || '',
          framework: analysis.frameworks || []
        })
      }
    } catch (error) {
      console.error('Failed to analyze selected repository:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="hard" className="overflow-hidden">
      {/* Method Toggle */}
      <div className="flex border-b-2 border-wharf-border-primary">
        <button
          onClick={() => setImportMethod('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono font-bold text-sm transition-colors ${
            importMethod === 'url' 
              ? 'bg-wharf-pink text-wharf-black' 
              : 'bg-wharf-surface-secondary hover:bg-wharf-surface-tertiary'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Paste URL
        </button>
        <button
          onClick={() => setImportMethod('github')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 font-mono font-bold text-sm transition-colors ${
            importMethod === 'github' 
              ? 'bg-wharf-pink text-wharf-black' 
              : 'bg-wharf-surface-secondary hover:bg-wharf-surface-tertiary'
          }`}
          disabled={!user}
        >
          <FaGithub className="w-4 h-4" />
          Import from GitHub
        </button>
      </div>

      <div className="p-6">
        {importMethod === 'url' ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Input
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="primary" 
                onClick={handleUrlSubmit}
                loading={isLoading}
              >
                Analyze
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="font-mono text-xs text-wharf-text-tertiary">
              Examples: github.com/facebook/react, github.com/vercel/next.js
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <RepoSelector user={user} onSelect={handleRepoSelect} />
            {/* <RecentReposList onSelect={onRepoSelect} /> */}
          </div>

        )}
      </div>
    </Card>
  )
}