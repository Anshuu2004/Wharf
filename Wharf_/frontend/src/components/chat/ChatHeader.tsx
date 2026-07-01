import { Download, GitBranch, Settings } from 'lucide-react'
import { Badge } from '../ui/Badge'

interface ChatSession {
  id: string
  title: string
  repoData?: {
    name: string
    owner: string
    language: string
    stars: number
    forks: number
  }
}

interface ChatHeaderProps {
  session?: ChatSession | null
  onExport: () => void
}

export const ChatHeader = ({ session, onExport }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b-2 border-wharf-border-secondary bg-wharf-surface-secondary">
      <div className="flex items-center gap-3">
        <h1 className="font-display font-black text-xl tracking-tighter">
          WHARF <span className="text-wharf-pink">Chat</span>
        </h1>
        {session?.repoData && (
          <>
            <div className="w-px h-6 bg-wharf-border-secondary" />
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-wharf-text-tertiary" />
              <span className="font-mono text-sm font-bold">
                {session.repoData.owner}/{session.repoData.name}
              </span>
              <Badge variant="cyan" size="sm">{session.repoData.language}</Badge>
              <Badge variant="pink" size="sm">{session.repoData.stars}⭐</Badge>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-3 py-1.5 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:border-wharf-border-primary hover:bg-wharf-surface-primary transition-colors"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
        <button className="p-1.5 border-2 border-wharf-border-secondary hover:border-wharf-border-primary hover:bg-wharf-surface-primary transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}