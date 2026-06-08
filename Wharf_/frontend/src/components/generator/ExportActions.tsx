import { Copy, Download, Save, Check } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { Button, Card } from '../ui'
import { useState } from 'react'

interface ExportActionsProps {
  content: string
  repoName?: string
}

export const ExportActions = ({ content, repoName }: ExportActionsProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${repoName || 'README'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    // TODO: Save to dashboard
    console.log('Save to dashboard')
  }

  const handleGist = () => {
    console.log('Create Gist')
  }

  return (
    <Card variant="hard-sm" className="flex flex-wrap gap-2 justify-center">
      <Button size="sm" variant="secondary" onClick={handleCopy}>
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button size="sm" variant="secondary" onClick={handleDownload}>
        <Download className="w-4 h-4" />
        Download
      </Button>
      <Button size="sm" variant="secondary" onClick={handleSave}>
        <Save className="w-4 h-4" />
        Save
      </Button>
      <Button size="sm" variant="secondary" onClick={handleGist}>
        <FaGithub className="w-4 h-4" />
        Create Gist
      </Button>
    </Card>
  )
}