import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Trash2, Plus } from 'lucide-react'

export interface SocialLink {
  provider: string; // e.g. LinkedIn, Twitter, Portfolio, Gmail
  url: string;
}

interface SocialBadgesInputProps {
  links: SocialLink[]
  onChange: (links: SocialLink[]) => void
}

const COMMON_PROVIDERS = ['LinkedIn', 'Twitter', 'Portfolio', 'Gmail', 'Discord', 'YouTube', 'Medium', 'Dev.to', 'Instagram', 'Facebook', 'Twitch']

export const SocialBadgesInput = ({ links, onChange }: SocialBadgesInputProps) => {
  const [provider, setProvider] = useState('LinkedIn')
  const [url, setUrl] = useState('')

  const handleAdd = () => {
    if (!url.trim()) return
    onChange([...links, { provider, url }])
    setUrl('')
  }

  const handleRemove = (index: number) => {
    const newLinks = [...links]
    newLinks.splice(index, 1)
    onChange(newLinks)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="bg-wharf-surface-primary border-2 border-wharf-border-primary text-wharf-text-primary px-3 py-2 font-mono text-sm shadow-brutal-sm focus:outline-none focus:ring-2 focus:ring-wharf-pink"
        >
          {COMMON_PROVIDERS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
          <option value="Custom">Custom</option>
        </select>
        <Input 
          className="flex-1"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} variant="primary" className="px-3">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {links.map((link, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 bg-wharf-surface-secondary border-2 border-wharf-border-primary shadow-brutal-sm">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="font-mono font-bold text-sm min-w-20">{link.provider}:</span>
              <span className="font-mono text-sm text-wharf-text-secondary truncate">{link.url}</span>
            </div>
            <button 
              onClick={() => handleRemove(idx)}
              className="text-wharf-text-tertiary hover:text-wharf-red p-1 transition-colors group"
            >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        ))}
        {links.length === 0 && (
          <p className="font-mono text-xs text-wharf-text-tertiary">No social links added yet.</p>
        )}
      </div>
    </div>
  )
}
