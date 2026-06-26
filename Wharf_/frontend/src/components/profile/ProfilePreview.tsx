import { Card } from '../ui/Card'
import { FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'

interface ProfilePreviewProps {
  content: string
  profileData: any
  template: string
  theme: string
}

export const ProfilePreview = ({ content }: ProfilePreviewProps) => {
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
      
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {content ? (
          <div className="markdown-preview prose prose-brutalist max-w-none">
            <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-wharf-text-tertiary mx-auto mb-3" />
            <p className="font-mono text-sm text-wharf-text-tertiary">
              Your profile README will appear here
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}