import { useState } from 'react'
import { Card } from '../ui/Card'
import { FileText, Edit2, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'github-markdown-css/github-markdown.css'

interface ReadmePreviewProps {
  content: string
}

export const ReadmePreview = ({ content: initialContent }: ReadmePreviewProps) => {
  const [content, setContent] = useState(initialContent)

  // Sync Content If Generation Updates It
  if (initialContent !== content && initialContent.length > content.length) {
    setContent(initialContent)
  }

  return (
    <Card variant="hard" className="overflow-hidden flex flex-col h-[600px]">
      <div className="border-b-2 border-wharf-border-primary p-3 bg-wharf-surface-secondary flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-wharf-error" />
          <div className="w-3 h-3 rounded-full bg-wharf-warning" />
          <div className="w-3 h-3 rounded-full bg-wharf-success" />
          <span className="font-mono text-xs ml-2 font-bold tracking-tight">README.md Editor</span>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className="w-1/2 border-r-2 border-wharf-border-primary bg-wharf-bg relative flex flex-col">
          <div className="absolute top-0 right-0 p-2 opacity-50"><Edit2 className="w-4 h-4 text-wharf-text-tertiary" /></div>
          <textarea 
            className="w-full flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm text-wharf-text-secondary custom-scrollbar"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Generated markdown will appear here for editing..."
          />
        </div>

        {/* Preview Pane */}
        <div className="w-1/2 bg-white relative flex flex-col">
          <div className="absolute top-0 right-0 p-2 opacity-50"><Eye className="w-4 h-4 text-wharf-text-tertiary" /></div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar markdown-body" style={{ backgroundColor: 'white' }}>
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-wharf-text-tertiary opacity-60">
                <FileText className="w-12 h-12 mb-3" />
                <p className="font-mono text-sm">Preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

