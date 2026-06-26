import { useState } from 'react'
import { Sparkles, RefreshCw, Edit2, Check } from 'lucide-react'
import { Input } from '../ui'

interface BioGeneratorProps {
  bio: string
  onGenerate: (bio: string) => void
}

const bioTones = [
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
  { id: 'technical', label: 'Technical' },
  { id: 'fun', label: 'Fun' },
]

export const BioGenerator = ({ bio, onGenerate }: BioGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editBio, setEditBio] = useState(bio)
  const [selectedTone, setSelectedTone] = useState('professional')

  const handleAIGenerate = async () => {
    setIsGenerating(true)
    // TODO: Call AI API to generate bio
    setTimeout(() => {
      const newBio = `Full Stack Developer passionate about building impactful applications. ${selectedTone === 'creative' ? '✨ Creative problem solver' : ''} ${selectedTone === 'technical' ? '⚡ Tech enthusiast' : ''}`
      onGenerate(newBio)
      setEditBio(newBio)
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-wharf-purple" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider">Bio</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 border border-wharf-border-secondary hover:border-wharf-pink transition-colors"
          >
            {isEditing ? <Check className="w-3 h-3" /> : <Edit2 className="w-3 h-3" />}
          </button>
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2 py-1 border border-wharf-border-secondary hover:border-wharf-pink transition-colors disabled:opacity-50 text-[10px] font-mono font-bold"
          >
            {isGenerating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            AI Generate
          </button>
        </div>
      </div>

      {/* Tone Selector */}
      <div className="flex flex-wrap gap-1">
        {bioTones.map((tone) => (
          <button
            key={tone.id}
            onClick={() => setSelectedTone(tone.id)}
            className={`px-2 py-0.5 border text-[9px] font-mono font-bold transition-colors ${
              selectedTone === tone.id
                ? 'border-wharf-border-primary bg-wharf-pink'
                : 'border-wharf-border-secondary hover:border-wharf-border-primary'
            }`}
          >
            {tone.label}
          </button>
        ))}
      </div>

      {/* Bio Display/Edit */}
      {isEditing ? (
        <Input
          value={editBio}
          onChange={(e) => setEditBio(e.target.value)}
          onBlur={() => {
            onGenerate(editBio)
            setIsEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onGenerate(editBio)
              setIsEditing(false)
            }
          }}
          className="text-sm font-mono"
          placeholder="Write your bio..."
        />
      ) : (
        <div className="p-2 border border-wharf-border-secondary bg-wharf-surface-secondary min-h-[40px]">
          <p className="font-mono text-sm text-wharf-text-secondary">
            {bio || 'No bio set. Click AI Generate or edit to add one.'}
          </p>
        </div>
      )}
    </div>
  )
}