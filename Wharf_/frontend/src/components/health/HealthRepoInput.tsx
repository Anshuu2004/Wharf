import { useState } from 'react';
import {
  Link2,
  ArrowRight,
  GitBranch,
  Star,
  GitFork,
  AlertCircle,
  Zap,
  Info,
  CheckCircle,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Input, Button, Card, Badge } from '../ui';

interface HealthRepoInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  recentRepos?: string[];
  onRecentSelect?: (url: string) => void;
  onClearRecent?: () => void;
}

export const HealthRepoInput = ({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  isLoading,
  recentRepos = [],
}: HealthRepoInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [, setShowRecent] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [networkValid, setNetworkValid] = useState<boolean | null>(null);

  // Define Examples
  const examples = [
    { name: 'facebook/react', stars: '222k', description: 'React UI library' },
    { name: 'vercel/next.js', stars: '120k', description: 'React framework' },
    { name: 'tailwindlabs/tailwindcss', stars: '78k', description: 'CSS framework' },
    { name: 'vuejs/vue', stars: '206k', description: 'Vue.js framework' },
  ];

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
        // Rate Limited Error
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  const handleAnalyze = () => {
    const validation = validateUrl(repoUrl);

    if (!validation.isValid) {
      setTouched(true);
      return;
    }

    onAnalyze();
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
        // Trigger Network Validation After Paste
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

  const validation = getValidationStatus();
  const isValid = isValidUrl();

  // Determine If The Button Should Be Disabled
  const isButtonDisabled = isLoading || (touched && !isValid) || isValidating;

  return (
    <Card variant="hard" rounded="3xl" className="overflow-visible">
      {/* Header */}
      <div className="flex items-center gap-2 border-b-2 border-wharf-border-primary pb-3 mb-4">
        <div className="p-1.5 bg-wharf-pink/10 border border-wharf-pink/20 rounded-lg">
          <FaGithub className="w-4 h-4 text-wharf-pink-dark" />
        </div>
        <span className="font-mono font-bold text-sm uppercase tracking-wider">
          Repository Health Check
        </span>
        <Badge variant="cyan" size="sm" className="ml-auto gap-1">
          <Zap className="w-3 h-3" />
          Free Analysis
        </Badge>
      </div>

      {/* Main Input Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 mt-6 mb-4">
          <div className="flex-1 relative">
            {/* GitHub Icon */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <div
                className={`p-1 rounded-md transition-colors ${
                  isFocused ? 'bg-wharf-pink/10 text-wharf-pink' : 'text-wharf-text-tertiary'
                }`}
              ></div>
            </div>

            <Input
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={handleUrlChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => {
                setIsFocused(true);
                if (recentRepos.length > 0) setShowRecent(true);
                setTouched(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowRecent(false), 200);
                if (isValid) {
                  validateRepoExists(repoUrl);
                }
              }}
              className={`pl-12 font-mono text-sm transition-all duration-300 rounded-2xl ${
                isFocused ? 'border-wharf-pink ring-2 ring-wharf-pink/20' : ''
              } ${touched && repoUrl ? (isValid ? 'border-wharf-green/50' : 'border-wharf-error/50') : ''}`}
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
            onClick={handleAnalyze}
            loading={isLoading}
            disabled={isButtonDisabled || networkValid === false}
            className="min-w-[160px] group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>Analyzing...</>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Analyze Health
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
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

        {/* Quick Examples */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-wharf-cyan-darker" />
              <span className="font-mono text-xs text-wharf-text-tertiary font-bold uppercase tracking-wider">
                Popular Examples
              </span>
            </div>
            <div className="flex-1 h-px bg-wharf-border-secondary" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {examples.map((example) => (
              <button
                key={example.name}
                onClick={() => handleExampleClick(example.name)}
                className="group relative p-3 border-2 border-wharf-border-secondary hover:border-wharf-pink hover:bg-wharf-pink/10 transition-all rounded-xl text-left cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold truncate transition-colors">
                      {example.name}
                    </p>
                    <p className="font-mono text-[10px] text-wharf-text-secondary mt-0.5 capitalize">
                      {example.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Star className="w-3 h-3 text-wharf-yellow-dark fill-wharf-yellow" />
                    <span className="font-mono text-[10px] text-wharf-text-tertiary">
                      {example.stars}
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-wharf-pink/20 rounded-xl transition-colors pointer-events-none" />
              </button>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="flex flex-wrap items-center justify-center pt-2">
          <div className="flex flex-wrap gap-4">
            <span className="font-mono text-[10px] text-wharf-text-secondary flex items-center gap-1.5 capitalize">
              <Info className="w-3 h-3" />
              Pro Tips
            </span>{' '}
            <span className="text-wharf-text-tertiary">|</span>
            <span className="font-mono text-[10px] text-wharf-text-secondary flex items-center gap-1.5 capitalize">
              <GitBranch className="w-3 h-3" />
              Paste any GitHub URL
            </span>{' '}
            <span className="text-wharf-text-tertiary">|</span>
            <span className="font-mono text-[10px] text-wharf-text-secondary flex items-center gap-1.5 capitalize">
              <GitFork className="w-3 h-3" />
              Supports public repos
            </span>{' '}
            <span className="text-wharf-text-tertiary">|</span>
            <span className="font-mono text-[10px] text-wharf-text-secondary flex items-center gap-1.5 capitalize">
              <AlertCircle className="w-3 h-3" />
              Real-time analysis
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
