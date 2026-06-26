import { useState } from 'react'
import { ArrowRight, User } from 'lucide-react'
import { Badge, Button, Card, Input } from '../ui'
import { FaGithub } from 'react-icons/fa'

interface ProfileFormProps {
  user: any
  onFetch: (username: string) => void
  isLoading: boolean
}

export const ProfileForm = ({ user, onFetch, isLoading }: ProfileFormProps) => {
  const [username, setUsername] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onFetch(username.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <Card variant="hard" className="overflow-visible">
      <div className="flex items-center gap-2 border-b-2 border-wharf-border-primary pb-3 mb-4">
        <FaGithub className="w-5 h-5 text-wharf-pink" />
        <span className="font-mono font-bold text-sm uppercase tracking-wider">GitHub Profile</span>
        {user && (
          <Badge variant="cyan" size="sm" className="ml-auto">
            Logged in
          </Badge>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <User className="w-4 h-4 text-wharf-text-tertiary" />
            </div>
            <Input
              placeholder="Enter GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 font-mono text-sm"
            />
          </div>
          <Button 
            variant="primary" 
            type="submit"
            loading={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Fetching...' : 'Fetch Profile'}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Quick Examples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-wharf-text-tertiary">Examples:</span>
          {['octocat', 'torvalds', 'vercel'].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setUsername(example)
                onFetch(example)
              }}
              className="px-2 py-1 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-pink hover:bg-wharf-pink/10 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        {user && (
          <div className="flex items-center gap-3 p-3 border border-wharf-border-secondary bg-wharf-surface-secondary">
            <FaGithub className="w-4 h-4 text-wharf-text-secondary" />
            <span className="font-mono text-xs text-wharf-text-tertiary">
              Use your own profile: <button 
                type="button"
                onClick={() => {
                  setUsername(user.login || user.username || '')
                  onFetch(user.login || user.username || '')
                }}
                className="text-wharf-pink hover:underline font-bold"
              >
                @{user.login || user.username}
              </button>
            </span>
          </div>
        )}
      </form>
    </Card>
  )
}