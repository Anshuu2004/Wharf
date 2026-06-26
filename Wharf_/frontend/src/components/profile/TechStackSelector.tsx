import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Search, Sparkles, X } from 'lucide-react'

const COMMON_SKILLS = [
  'html', 'css', 'javascript', 'typescript', 'react', 'nextjs', 'vue', 'angular', 'svelte',
  'nodejs', 'express', 'nestjs', 'python', 'django', 'flask', 'fastapi', 'java', 'spring',
  'c', 'cpp', 'csharp', 'dotnet', 'go', 'rust', 'php', 'laravel', 'ruby', 'rails',
  'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'docker', 'kubernetes', 'aws',
  'gcp', 'azure', 'vercel', 'netlify', 'firebase', 'supabase', 'git', 'github', 'gitlab',
  'linux', 'ubuntu', 'bash', 'figma', 'tailwindcss', 'sass', 'prisma', 'graphql',
  'kotlin', 'swift', 'dart', 'flutter', 'elixir', 'erlang', 'haskell', 'clojure', 'ocaml',
  'solidity', 'powershell', 'lua', 'vim', 'neovim', 'vscode', 'apple', 'android', 'nginx',
  'jenkins', 'kafka', 'rabbitmq', 'cassandra', 'dynamodb', 'elasticsearch', 'django',
]

interface TechStackSelectorProps {
  selected: string[]
  onChange: (stack: string[]) => void
  detectedStack: string[]
}

export const TechStackSelector = ({ selected, onChange, detectedStack }: TechStackSelectorProps) => {
  const [search, setSearch] = useState('')

  const handleToggle = (skill: string) => {
    if (selected.includes(skill)) {
      onChange(selected.filter(s => s !== skill))
    } else {
      onChange([...selected, skill])
    }
  }

  const handleMagicAutofill = () => {
    const parsedDetected = detectedStack.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''))
    const finalStack = parsedDetected.filter(s => COMMON_SKILLS.includes(s) || s === 'c++' ? 'cpp' : s)
    onChange(Array.from(new Set([...selected, ...finalStack])))
  }

  const filteredSkills = COMMON_SKILLS.filter(s => s.includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technologies..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleMagicAutofill} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-wharf-pink" />
          Magic Auto-Fill
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="p-3 bg-wharf-surface-primary border-2 border-wharf-border-secondary shadow-brutal-sm">
          <p className="font-mono text-xs text-wharf-text-secondary mb-2">Selected ({selected.length})</p>
          <div className="flex flex-wrap gap-2">
            {selected.map(skill => (
              <Badge key={skill} variant="cyan" className="cursor-pointer gap-1" onClick={() => handleToggle(skill)}>
                {skill} <X className="w-3 h-3" />
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={() => onChange([])} className="h-6 text-xs px-2">
              Clear All
            </Button>
          </div>
        </div>
      )}

      <div className="h-64 overflow-y-auto border-2 border-wharf-border-primary bg-wharf-surface-primary p-3">
        <div className="flex flex-wrap gap-2">
          {filteredSkills.map(skill => (
            <button
              key={skill}
              onClick={() => handleToggle(skill)}
              className={`px-3 py-1.5 font-mono text-sm border-2 transition-all ${
                selected.includes(skill) 
                  ? 'bg-wharf-pink border-wharf-border-primary text-black font-bold shadow-brutal-sm -translate-y-px' 
                  : 'bg-wharf-surface-secondary border-wharf-border-secondary text-wharf-text-secondary hover:border-wharf-pink/50'
              }`}
            >
              {skill}
            </button>
          ))}
          {filteredSkills.length === 0 && (
            <p className="text-wharf-text-tertiary font-mono text-sm w-full text-center py-8">
              No matching technologies found.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
