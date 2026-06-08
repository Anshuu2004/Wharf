import { useState, useEffect } from 'react'
import { Search, ChevronDown, Star, GitFork } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import api from '../../lib/api'

interface User {
  id: string
  name: string
  email: string
}

interface Repo {
  id: number
  name: string
  full_name: string
  stars: number
  forks: number
  language: string
  url?: string
  owner?: string
}

interface RepoSelectorProps {
  user: User | null
  onSelect: (repo: Repo) => void
}

export const RepoSelector = ({ user, onSelect }: RepoSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [repos, setRepos] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserRepos()
    }
  }, [user])

  const fetchUserRepos = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/user/repos')
      if (response.data && response.data.success) {
        setRepos(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user repos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRepos = repos.filter(repo => 
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <FaGithub className="w-4 h-4" />
          <span className="font-mono text-sm">Select a repository</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20 border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal">
          {/* Search */}
          <div className="p-3 border-b-2 border-wharf-border-secondary">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 font-mono text-sm border border-wharf-border-secondary focus:outline-none focus:border-wharf-pink"
              />
            </div>
          </div>

          {/* Repo List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-wharf-pink border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-mono text-xs text-wharf-text-tertiary mt-2">Loading repos...</p>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-mono text-sm text-wharf-text-tertiary">No repositories found</p>
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => {
                    onSelect(repo)
                    setIsOpen(false)
                  }}
                  className="w-full p-3 text-left hover:bg-wharf-surface-secondary transition-colors border-b border-wharf-border-secondary last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-sm">{repo.full_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-wharf-text-tertiary">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-wharf-text-tertiary">
                        <GitFork className="w-3 h-3" />
                        {repo.forks}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-wharf-text-tertiary">{repo.language}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}