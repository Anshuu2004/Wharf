import { Card } from '../ui/Card'
import { FileText } from 'lucide-react'

interface ReadmePreviewProps {
  content: string
}

export const ReadmePreview = ({ content }: ReadmePreviewProps) => {
  return (
    <Card variant="hard" className="overflow-hidden">
      <div className="border-b-2 border-wharf-border-primary p-3 bg-wharf-surface-secondary">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-wharf-error" />
          <div className="w-3 h-3 rounded-full bg-wharf-warning" />
          <div className="w-3 h-3 rounded-full bg-wharf-success" />
          <span className="font-mono text-xs ml-2">README.md</span>
        </div>
      </div>
      
      <div className="p-6 max-h-full overflow-y-auto">
        {content ? (
          <div className="markdown-preview prose prose-brutalist max-w-none">
            {/* Add Markdown Rendering With React-Markdown */}
            <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-wharf-text-tertiary mx-auto mb-3" />
            <p className="font-mono text-sm text-wharf-text-tertiary">
              Your generated README will appear here
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
