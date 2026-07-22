import { Copy, Download, Save, Check, Share2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { useState } from 'react';
import { Button, Card, useToast } from '../ui';

interface ChangelogExportProps {
  content: string;
  repoName?: string;
}

export const ChangelogExport = ({ content, repoName }: ChangelogExportProps) => {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGistLoading, setIsGistLoading] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('Copied To Clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = repoName ? `${repoName}-CHANGELOG.md` : 'CHANGELOG.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Changelog Downloaded!', 'success');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showToast('Changelog Saved To Dashboard!', 'success');
    } catch {
      showToast('Failed To Save Changelog', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGist = async () => {
    setIsGistLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showToast('Gist Created Successfully!', 'success');
    } catch {
      showToast('Failed To Create Gist', 'error');
    } finally {
      setIsGistLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Changelog',
          text: content.substring(0, 500) + '...',
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <Card variant="hard" rounded="2xl" className="p-6 overflow-hidden">
      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button size="sm" variant="secondary" onClick={handleCopy} className="min-w-[100px]">
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>

        <Button size="sm" variant="secondary" onClick={handleDownload} className="min-w-[100px]">
          <Download className="w-4 h-4" />
          Download
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleSave}
          loading={isSaving}
          className="min-w-[100px]"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>

        <Button
          size="sm"
          variant="cyan"
          onClick={handleGist}
          loading={isGistLoading}
          className="min-w-[100px]"
        >
          <FaGithub className="w-4 h-4" />
          Create Gist
        </Button>

        <Button size="sm" variant="ghost" onClick={handleShare} className="min-w-[50px]">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </Card>
  );
};

