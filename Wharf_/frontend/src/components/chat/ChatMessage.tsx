import { useState } from 'react'
import { Bot, User, Copy, Check } from 'lucide-react'
import { CodeBlock } from './CodeBlock'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  codeBlocks?: { code: string; language: string }[]
  timestamp: Date
}

export const ChatMessage = ({ role, content, codeBlocks, timestamp }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatContent = (text: string) => {
    // Simple markdown-like formatting
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) return <h3 key={i} className="font-display font-black text-lg mt-4 mb-2">{line.slice(4)}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="font-display font-black text-xl mt-6 mb-2">{line.slice(3)}</h2>
      if (line.startsWith('# ')) return <h1 key={i} className="font-display font-black text-2xl mt-6 mb-3">{line.slice(2)}</h1>
      
      // Bold
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <p key={i} className="font-mono text-sm text-wharf-text-secondary leading-relaxed mb-2">
            {parts.map((part, idx) => 
              idx % 2 === 1 ? <strong key={idx} className="text-wharf-text-primary">{part}</strong> : part
            )}
          </p>
        )
      }
      
      // Bullet points
      if (line.trim().startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 ml-4 mb-1">
            <span className="text-wharf-pink">•</span>
            <span className="font-mono text-sm text-wharf-text-secondary">{line.trim().slice(2)}</span>
          </div>
        )
      }
      
      // Numbered lists
      const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
      if (numberedMatch) {
        return (
          <div key={i} className="flex gap-2 ml-4 mb-1">
            <span className="font-mono text-sm font-bold text-wharf-pink">{numberedMatch[1]}.</span>
            <span className="font-mono text-sm text-wharf-text-secondary">{numberedMatch[2]}</span>
          </div>
        )
      }
      
      // Empty lines
      if (!line.trim()) return <div key={i} className="h-1" />
      
      // Regular text
      return <p key={i} className="font-mono text-sm text-wharf-text-secondary leading-relaxed mb-2">{line}</p>
    })
  }

  return (
    <div className={`flex gap-4 mb-6 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 ${role === 'user' ? 'order-2' : 'order-1'}`}>
        <div className={`w-8 h-8 border-2 border-wharf-border-primary flex items-center justify-center ${
          role === 'user' ? 'bg-wharf-pink' : 'bg-wharf-surface-secondary'
        }`}>
          {role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
      </div>

      {/* Message */}
      <div className={`flex-1 max-w-[80%] ${role === 'user' ? 'order-1' : 'order-2'}`}>
        <div className={`border-2 border-wharf-border-primary p-4 ${
          role === 'user' ? 'bg-wharf-pink' : 'bg-wharf-surface-secondary'
        }`}>
          <div className="text-sm font-mono">
            {formatContent(content)}
          </div>

          {/* Code Blocks */}
          {codeBlocks && codeBlocks.length > 0 && (
            <div className="mt-4 space-y-3">
              {codeBlocks.map((block, idx) => (
                <CodeBlock key={idx} code={block.code} language={block.language} />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={`flex gap-2 mt-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={() => copyToClipboard(content)}
            className="flex items-center gap-1 px-2 py-0.5 border border-wharf-border-secondary font-mono text-[10px] hover:border-wharf-border-primary hover:bg-wharf-surface-secondary transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <span className="font-mono text-[9px] text-wharf-text-tertiary/60 self-center">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  )
}