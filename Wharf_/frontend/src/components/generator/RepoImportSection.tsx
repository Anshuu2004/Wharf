import { useState } from 'react';
import { Link2, ArrowRight, Zap, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [networkValid, setNetworkValid] = useState<boolean | null>(null);
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

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      return { isValid: false, message: 'Please Enter A Repository URL' };
    }

    if (!url.includes('github.com')) {
      return { isValid: false, message: 'Please Enter A Valid GitHub Repository URL' };
    }

    // Check If URL Has The Correct Format: github.com/owner/repo
    const githubPattern = /github\.com\/[^/]+\/[^/]+/;
    if (!githubPattern.test(url)) {
      return {
        isValid: false,
        message: 'Invalid GitHub Repository Format. Use: https://github.com/owner/repo',
      };
    }

    return { isValid: true, message: 'Valid GitHub Repository URL' };
  };

  // Network Validation - Check If Repo Exists
  const validateRepoExists = async (url: string) => {
    if (!validateUrl(url).isValid) return;

    setIsValidating(true);
    setNetworkValid(null);

    try {
      // Extract Repo From URL
      const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
      if (!match) return;

      const repoPath = match[1];
      const apiUrl = `https://api.github.com/repos/${repoPath}`;

      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (response.status === 200) {
        setNetworkValid(true);
      } else if (response.status === 404) {
        setNetworkValid(false);
      } else {
        // Rate Limited
        setNetworkValid(null);
      }
    } catch {
      // Network Error
      setNetworkValid(null);
    } finally {
      setIsValidating(false);
    }
  };

  const isValidUrl = () => {
    const result = validateUrl(repoUrl);
    return result.isValid;
  };

  const getValidationStatus = () => {
    if (!touched || !repoUrl) return null;
    return validateUrl(repoUrl);
  };

  const handleUrlSubmit = async () => {
    const validation = validateUrl(repoUrl);

    if (!validation.isValid) {
      setTouched(true);
      return;
    }

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

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes('github.com')) {
      const match = pastedText.match(/github\.com\/([^/]+\/[^/\s]+)/);
      if (match) {
        const cleanUrl = `https://github.com/${match[1]}`;
        setRepoUrl(cleanUrl);
        setTouched(true);
        e.preventDefault();
        setTimeout(() => validateRepoExists(cleanUrl), 500);
      }
    }
  };

  const handleExampleClick = (example: string) => {
    const url = `https://github.com/${example}`;
    setRepoUrl(url);
    setTouched(true);
    setTimeout(() => validateRepoExists(url), 500);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoUrl(value);
    setTouched(true);
    setNetworkValid(null); // Reset Network Validation On Change
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  const validation = getValidationStatus();
  const isValid = isValidUrl();
  const isButtonDisabled =
    isLoading || (touched && !isValid) || isValidating || networkValid === false;

  const examples = [
    { name: 'facebook/react', stars: '222k', description: 'React UI library' },
    { name: 'vercel/next.js', stars: '120k', description: 'React framework' },
    { name: 'tailwindlabs/tailwindcss', stars: '78k', description: 'CSS framework' },
    { name: 'vuejs/vue', stars: '206k', description: 'Vue.js framework' },
  ];

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
                    <Link2
                      className={`w-4 h-4 transition-colors ${
                        touched && repoUrl
                          ? isValid
                            ? 'text-wharf-green'
                            : 'text-wharf-error'
                          : 'text-wharf-text-tertiary'
                      }`}
                    />
                  </div>
                  <Input
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={handleUrlChange}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onFocus={() => {
                      setTouched(true);
                    }}
                    onBlur={() => {
                      if (isValid) {
                        validateRepoExists(repoUrl);
                      }
                    }}
                    className={`pl-9 font-mono text-sm transition-all duration-300 rounded-2xl ${
                      touched && repoUrl
                        ? isValid
                          ? 'border-wharf-green/50'
                          : 'border-wharf-error/50'
                        : ''
                    }`}
                  />

                  {/* Validation Indicator */}
                  {touched && repoUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidating ? (
                        <div className="w-4 h-4 border-2 border-wharf-cyan border-t-transparent rounded-full animate-spin" />
                      ) : isValid ? (
                        networkValid === false ? (
                          <AlertCircle className="w-4 h-4 text-wharf-error" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-wharf-green-darker" />
                        )
                      ) : (
                        <AlertCircle className="w-4 h-4 text-wharf-error" />
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  rounded="2xl"
                  onClick={handleUrlSubmit}
                  loading={isLoading}
                  disabled={isButtonDisabled}
                  className="min-w-[120px]"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>

              {/* Validation Message */}
              {touched && repoUrl && !isValid && validation && (
                <div className="flex items-center gap-2 p-2 bg-wharf-error/5 border border-wharf-error/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-wharf-error flex-shrink-0" />
                  <span className="font-mono text-xs text-wharf-error capitalize">
                    {validation.message}
                  </span>
                </div>
              )}

              {touched && repoUrl && isValid && networkValid === false && (
                <div className="flex items-center gap-2 p-2 bg-wharf-error/5 border border-wharf-error/50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-wharf-error flex-shrink-0" />
                  <span className="font-mono text-xs text-wharf-error capitalize">
                    Repository not found. Please check the URL & try again.
                  </span>
                </div>
              )}

              {touched && repoUrl && isValid && networkValid === true && (
                <div className="flex items-center gap-2 p-2 bg-wharf-green/15 border border-wharf-green-dark rounded-lg">
                  <CheckCircle className="w-4 h-4 text-wharf-green-darker flex-shrink-0" />
                  <span className="font-mono text-xs text-wharf-green-darker capitalize">
                    Valid GitHub Repository - Ready to analyze
                  </span>
                </div>
              )}

              {/* Examples Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-wharf-cyan-darker" />
                    <span className="font-mono text-xs text-wharf-text-tertiary font-bold uppercase tracking-wider">
                      Popular Examples
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-wharf-border-secondary" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {examples.map((example) => (
                    <button
                      key={example.name}
                      onClick={() => handleExampleClick(example.name)}
                      className="group relative p-3 border-2 border-wharf-border-secondary hover:border-wharf-pink hover:bg-wharf-pink/5 transition-all rounded-xl text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-xs font-bold truncate">{example.name}</p>
                          <p className="font-mono text-[10px] text-wharf-text-tertiary mt-0.5 capitalize">
                            {example.description}
                          </p>
                        </div>
                      </div>
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-wharf-pink/20 rounded-xl transition-colors pointer-events-none" />
                    </button>
                  ))}
                </div>
              </div>
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
