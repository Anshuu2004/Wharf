import { GitBranch, Star, GitFork, RefreshCw, Link2 } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface RepoData {
  name: string
  owner: string
  language: string
  stars: number
  forks: number
  description: string
}

interface RepoContextBarProps {
  repoUrl: string
  setRepoUrl: (url: string) => void
  onAnalyze: () => void
  isAnalyzing: boolean
  repoData?: RepoData
  isAnalyzed: boolean
}

export const RepoContextBar = ({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  isAnalyzing,
  repoData,
  isAnalyzed
}: RepoContextBarProps) => {
  return (
    <div className="w-full">
      {/* Input Row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Link2 className="w-4 h-4 text-wharf-text-tertiary" />
          </div>
          <Input
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="pl-9 font-mono text-sm h-8"
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAnalyze}
          loading={isAnalyzing}
          className="whitespace-nowrap h-8"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {/* Repo Data - Show when analyzed */}
      {isAnalyzed && repoData && (
        <div className="mt-2 pt-2 border-t-2 border-wharf-border-primary">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-wharf-pink" />
              <span className="font-mono font-bold text-xs">
                {repoData.owner}/{repoData.name}
              </span>
            </div>
            
            <Badge variant="cyan" size="sm">{repoData.language}</Badge>
            
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-wharf-yellow fill-wharf-yellow" />
                <span className="font-mono text-[10px]">{repoData.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <GitFork className="w-3 h-3 text-wharf-text-tertiary" />
                <span className="font-mono text-[10px]">{repoData.forks.toLocaleString()}</span>
              </div>
              <button className="p-0.5 border border-wharf-border-secondary hover:border-wharf-border-primary transition-colors">
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
          
          {repoData.description && (
            <p className="font-mono text-[10px] text-wharf-text-tertiary mt-1">
              {repoData.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}