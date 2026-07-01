import { useState } from 'react'
import { Download, Copy, Check, FileText } from 'lucide-react'
import { useToast } from '../ui/useToast'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatExportProps {
  messages: Message[]
  repoName?: string
}

export const ChatExport = ({ messages, repoName }: ChatExportProps) => {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const generateMarkdown = () => {
    const header = `# WHARF Chat Export\n\n`
    const repo = repoName ? `**Repository:** ${repoName}\n\n` : ''
    const separator = `---\n\n`
    
    const conversation = messages.map(msg => {
      const role = msg.role === 'user' ? '**User**' : '**Assistant**'
      const time = new Date(msg.timestamp).toLocaleString()
      return `${role} (${time})\n\n${msg.content}\n\n`
    }).join(separator)
    
    return header + repo + separator + conversation
  }

  const handleCopy = async () => {
    const markdown = generateMarkdown()
    await navigator.clipboard.writeText(markdown)
    setCopied(true)
    showToast('Copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const markdown = generateMarkdown()
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded successfully!', 'success')
  }

  return (
    <Card variant="hard-sm" className="flex flex-wrap gap-2 justify-center p-4">
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button size="sm" variant="secondary" onClick={handleDownload}>
        <Download className="w-4 h-4" />
        Download
      </Button>
      <Button size="sm" variant="ghost" disabled>
        <FileText className="w-4 h-4" />
        {messages.length} messages
      </Button>
    </Card>
  )
}