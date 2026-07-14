import { Link2, ArrowRight, Zap, CheckCircle, AlertCircle, GitBranch } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Input, Button, Card, Badge } from '../ui';
import { useState } from 'react';

interface ChangelogInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  apiError?: string | null;
}

export const ChangelogInput = ({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  isLoading,
  apiError,
}: ChangelogInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);

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
      }
    }
  };

  const handleExampleClick = (example: string) => {
    const url = `https://github.com/${example}`;
    setRepoUrl(url);
    setTouched(true);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoUrl(value);
    setTouched(true);
  };

  const validation = getValidationStatus();
  const isValid = isValidUrl();
  const isButtonDisabled = isLoading || (touched && !isValid);

  const examples = [
    { name: 'facebook/react', stars: '222k', description: 'React UI library' },
    { name: 'vercel/next.js', stars: '120k', description: 'React framework' },
    { name: 'tailwindlabs/tailwindcss', stars: '78k', description: 'CSS framework' },
    { name: 'vuejs/vue', stars: '206k', description: 'Vue.js framework' },
  ];

  return (
    <Card variant="hard" rounded="3xl" className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 border-b-2 border-wharf-border-primary pb-3 mb-4">
          <div className="p-1.5 rounded-lg bg-wharf-pink/10">
            <FaGithub className="w-4 h-4 text-wharf-pink" />
          </div>
          <span className="font-mono font-bold text-sm uppercase tracking-wider">
            Generate Changelog
          </span>
          <Badge variant="cyan" size="sm" className="ml-auto gap-1">
            <Zap className="w-3 h-3" />
            Auto-detect
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {/* Input Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Link2
                  className={`w-4 h-4 transition-colors ${
                    isFocused ? 'text-wharf-pink' : 'text-wharf-text-tertiary'
                  }`}
                />
              </div>
              <Input
                placeholder="https://github.com/owner/repo"
                value={repoUrl}
                onChange={handleUrlChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setIsFocused(true);
                  setTouched(true);
                }}
                onBlur={() => {
                  setIsFocused(false);
                }}
                onPaste={handlePaste}
                className={`pl-9 font-mono text-sm transition-all duration-300 rounded-2xl ${
                  isFocused ? 'border-wharf-pink ring-2 ring-wharf-pink/20' : ''
                } ${touched && repoUrl ? (isValid ? 'border-wharf-green/50' : 'border-wharf-error/50') : ''}`}
              />

              {/* Validation Indicator */}
              {touched && repoUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValid ? (
                    <CheckCircle className="w-4 h-4 text-wharf-green-darker" />
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
              disabled={isButtonDisabled}
              className="min-w-[160px] group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Fetch Commits
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              {!isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-wharf-pink to-wharf-pink-dark opacity-0 group-hover:opacity-10 transition-opacity" />
              )}
            </Button>
          </div>

          {/* Validation Message */}
          {apiError && (
            <div className="flex items-center gap-2 p-2 bg-wharf-error/5 border border-wharf-error/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-wharf-error flex-shrink-0" />
              <span className="font-mono text-xs text-wharf-error capitalize">{apiError}</span>
            </div>
          )}

          {touched && repoUrl && !isValid && validation && !apiError && (
            <div className="flex items-center gap-2 p-2 bg-wharf-error/5 border border-wharf-error/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-wharf-error flex-shrink-0" />
              <span className="font-mono text-xs text-wharf-error capitalize">
                {validation.message}
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
      </div>
    </Card>
  );
};
