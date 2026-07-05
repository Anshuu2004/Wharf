import { useState } from 'react';
import { Link2, ArrowRight, Zap } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Badge, Button, Card, Input } from '../ui';
import { RepoSelector } from './RepoSelector';
import api from '../../lib/api';

export interface RepoData {
  url: string;
  owner: string;
  repo: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  framework: string[];
}

interface RepoImportSectionProps {
  user: { id: string; name?: string; email?: string; username?: string } | null;
  onRepoSelect: (repo: RepoData) => void;
}

export const RepoImportSection = ({ user, onRepoSelect }: RepoImportSectionProps) => {
  const [importMethod, setImportMethod] = useState<'url' | 'github'>('url');
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentRepos] = useState<
    {
      id: number;
      name: string;
      full_name: string;
      stars: number;
      forks: number;
      language: string;
      url?: string;
      owner?: string;
      private?: boolean;
      updated_at?: string;
    }[]
  >([]);

  const handleUrlSubmit = async () => {
    if (!repoUrl) return;

    setIsLoading(true);
    try {
      const response = await api.post('/repo/analyze', { repoUrl });
      if (response.data && response.data.success) {
        const analysis = response.data.data;
        onRepoSelect({
          url: repoUrl,
          owner: analysis.meta.owner,
          repo: analysis.meta.name,
          description: analysis.meta.description || '',
          stars: analysis.meta.stars || 0,
          forks: analysis.meta.forks || 0,
          language: analysis.meta.language || '',
          framework: analysis.frameworks || [],
        });
      }
    } catch (error) {
      console.error('Failed to analyze repository:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepoSelect = async (repo: {
    id: number;
    name: string;
    full_name: string;
    stars: number;
    forks: number;
    language: string;
    url?: string;
    owner?: string;
    private?: boolean;
    updated_at?: string;
  }) => {
    setIsLoading(true);
    const targetUrl = repo.url || `https://github.com/${repo.full_name}`;
    try {
      const response = await api.post('/repo/analyze', { repoUrl: targetUrl });
      if (response.data && response.data.success) {
        const analysis = response.data.data;
        onRepoSelect({
          url: targetUrl,
          owner: analysis.meta.owner,
          repo: analysis.meta.name,
          description: analysis.meta.description || '',
          stars: analysis.meta.stars || 0,
          forks: repo.forks || 0,
          language: analysis.meta.language || '',
          framework: analysis.frameworks || [],
        });
      }
    } catch (error) {
      console.error('Failed to analyze selected repository:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <div className="relative overflow-visible">
      <Card variant="hard" rounded="3xl" className="overflow-visible">
        {/* Method Toggle */}
        <div className="flex border-b-2 border-wharf-border-primary">
          <button
            onClick={() => setImportMethod('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-mono font-bold text-sm transition-colors ${
              importMethod === 'url'
                ? 'bg-wharf-pink text-wharf-black'
                : 'bg-wharf-surface-secondary hover:bg-wharf-surface-tertiary'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Paste URL
          </button>
          <button
            onClick={() => setImportMethod('github')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-mono font-bold text-sm transition-colors cursor-pointer ${
              importMethod === 'github'
                ? 'bg-wharf-pink text-wharf-black'
                : 'bg-wharf-surface-secondary hover:bg-wharf-surface-tertiary'
            }`}
            disabled={!user}
          >
            <FaGithub className="w-4 h-4" />
            Import from GitHub
            {!user && (
              <Badge variant="ghost" size="sm" className="ml-1">
                Sign in
              </Badge>
            )}
          </button>
        </div>

        <div className="p-6">
          {importMethod === 'url' ? (
            <div className="space-y-4">
              {/* URL Input Section */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Link2 className="w-4 h-4 text-wharf-text-tertiary" />
                  </div>
                  <Input
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-9 font-mono text-sm"
                  />
                </div>
                <Button
                  variant="primary"
                  rounded="2xl"
                  onClick={handleUrlSubmit}
                  loading={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>

              {/* Example URLs */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-wharf-text-tertiary">Try:</span>
                {['facebook/react', 'vercel/next.js', 'tailwindlabs/tailwindcss'].map((example) => (
                  <button
                    key={example}
                    onClick={() => setRepoUrl(`https://github.com/${example}`)}
                    className="px-2 py-1 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-pink hover:bg-wharf-pink/10 transition-colors cursor-pointer"
                  >
                    {example}
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              {repoUrl && repoUrl.includes('github.com/') && !isLoading && (
                <div className="flex items-center gap-4 p-3 border border-wharf-border-secondary bg-wharf-surface-secondary">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-wharf-teal" />
                    <span className="font-mono text-xs text-wharf-text-tertiary capitalize">
                      Ready to analyze
                    </span>
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1">
                    <FaGithub className="w-3 h-3 text-wharf-text-tertiary" />
                    <span className="font-mono text-xs text-wharf-text-tertiary truncate max-w-[150px]">
                      {repoUrl.replace('https://github.com/', '')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* GitHub Import Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaGithub className="w-5 h-5 text-wharf-text-primary" />
                  <span className="font-mono text-sm font-bold">
                    {user ? `${user.username || user.email}'s Repositories` : 'Connect GitHub'}
                  </span>
                </div>
                {user && (
                  <Badge variant="cyan" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Personal Access
                  </Badge>
                )}
              </div>

              {/* Repo Selector */}
              <RepoSelector user={user} onSelect={handleRepoSelect} />

              {/* Recent Repositories */}
              {user && recentRepos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-wharf-border-secondary" />
                    <span className="font-mono text-[10px] text-wharf-text-tertiary uppercase tracking-wider">
                      Recent
                    </span>
                    <div className="h-px flex-1 bg-wharf-border-secondary" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentRepos.map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() => handleRepoSelect(repo)}
                        className="px-3 py-1 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-pink hover:bg-wharf-pink/10 transition-colors"
                      >
                        {repo.full_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
