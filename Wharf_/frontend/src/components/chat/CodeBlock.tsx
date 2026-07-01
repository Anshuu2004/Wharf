import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language: string
}

export const CodeBlock = ({ code, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border-2 border-wharf-border-primary overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-wharf-surface-secondary border-b-2 border-wharf-border-primary">
        <span className="font-mono text-[10px] font-bold text-wharf-text-tertiary uppercase">
          {language}
        </span>
        <button
          onClick={copyToClipboard}
          className="p-1 hover:bg-wharf-pink/10 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-wharf-green" /> : <Copy className="w-3 h-3 text-wharf-text-tertiary" />}
        </button>
      </div>
      <pre className="p-3 bg-wharf-surface-primary overflow-x-auto">
        <code className="font-mono text-xs text-wharf-text-secondary whitespace-pre-wrap">
          {code}
        </code>
      </pre>
    </div>
  )
}