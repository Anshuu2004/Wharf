import { Copy, Download, Check } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { Button, Card } from '../ui'
import { useState } from 'react'
import { useToast } from '../ui/useToast'

interface ProfileExportActionsProps {
  content: string
  username?: string
}

export const ProfileExportActions = ({ content, username }: ProfileExportActionsProps) => {
  const [copied, setCopied] = useState(false)
  const { showToast } = useToast()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    showToast('Copied to clipboard!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${username || 'profile'}-README.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('README downloaded!', 'success')
  }

  const handlePushToGitHub = () => {
    // TODO: Push to GitHub profile repo
    showToast('Pushing to GitHub...', 'info')
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
      <Button size="sm" variant="primary" onClick={handlePushToGitHub}>
        <FaGithub className="w-4 h-4" />
        Push to Profile
      </Button>
    </Card>
  )
}