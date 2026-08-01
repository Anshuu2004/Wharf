import { AlertCircle, CheckCircle, Link2, Lock } from 'lucide-react';
import { Button, Input } from '../ui';
import { useState } from 'react';
import { useToast } from '../ui/useToast';

interface RepoData {
  name: string;
  owner: string;
  language: string;
  stars: number;
  forks: number;
  description: string;
}

interface RepoContextBarProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  repoData?: RepoData;
  isAnalyzed: boolean;
  isLocked?: boolean;
}

export const RepoContextBar = ({
  repoUrl,
  setRepoUrl,
  onAnalyze,
  isAnalyzing,
  isLocked = false,
}: RepoContextBarProps) => {
  const { showToast } = useToast();
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [networkValid, setNetworkValid] = useState<boolean | null>(null);

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      return { isValid: false, message: 'Please enter a repository URL' };
    }

    if (!url.includes('github.com')) {
      return { isValid: false, message: 'Please enter a valid GitHub repository URL' };
    }

    // Check If URL Has The Correct Format: github.com/owner/repo
    const githubPattern = /github\.com\/[^/]+\/[^/]+/;
    if (!githubPattern.test(url)) {
      return { isValid: false, message: 'Invalid format. Use: https://github.com/owner/repo' };
    }

    return { isValid: true, message: 'Valid GitHub repository URL' };
  };

  // Network Validation - Check If Repo Exists
  const validateRepoExists = async (url: string) => {
    if (!validateUrl(url).isValid || isLocked) return;

    setIsValidating(true);
    setNetworkValid(null);

    try {
      // Extract Owner/Repo From URL
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
        showToast('Repository Found! Ready To Analyze.', 'success');
      } else if (response.status === 404) {
        setNetworkValid(null);
      } else {
        // Rate Limited Or Other Error - Fallback To Allow
        setNetworkValid(null);
        showToast('Unable To Verify Repository. Proceeding With Analysis.', 'warning');
      }
    } catch {
      // Network Error - Fallback To Allow
      setNetworkValid(null);
      showToast('Network Error. Unable To Verify Repository.', 'warning');
    } finally {
      setIsValidating(false);
    }
  };

  const isValidUrl = () => {
    const result = validateUrl(repoUrl);
    return result.isValid;
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRepoUrl(value);
    setTouched(true);
    setNetworkValid(null); // Reset Network Validation On Change
  };

  const handleAnalyze = () => {
    const validation = validateUrl(repoUrl);

    if (!validation.isValid) {
      setTouched(true);
      showToast(validation.message, 'error');
      return;
    }

    // If Network Validation Hasn't Been Done Or Is Pending, Validate First
    if (networkValid === null && !isValidating) {
      validateRepoExists(repoUrl);
      // Wait For Validation To Complete Before Analyzing
      const checkValidation = setInterval(() => {
        if (!isValidating) {
          clearInterval(checkValidation);
          if (networkValid !== false) {
            onAnalyze();
          }
        }
      }, 100);
      return;
    }

    if (networkValid === false) {
      showToast('Cannot Analyze: Repository Not Found.', 'error');
      return;
    }

    onAnalyze();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLocked) {
      handleAnalyze();
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

  const isValid = isValidUrl();
  const isButtonDisabled =
    isAnalyzing || (touched && !isValid) || isValidating || networkValid === false || isLocked;

  return (
    <div className="flex items-center gap-3 h-full">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLocked ? (
            <Lock className="w-3.5 h-3.5 text-wharf-pink" />
          ) : (
            <Link2
              className={`w-4 h-4 transition-colors ${
                touched && repoUrl
                  ? isValid
                    ? 'text-wharf-green'
                    : 'text-wharf-error'
                  : 'text-wharf-text-tertiary'
              }`}
            />
          )}
        </div>
        <Input
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => {
            if (!isLocked) setTouched(true);
          }}
          onBlur={() => {
            if (!isLocked && isValid) {
              validateRepoExists(repoUrl);
            }
          }}
          className={`pl-9 font-mono text-sm h-8 transition-all duration-300 ${
            isLocked ? 'opacity-60 cursor-not-allowed select-none' : ''
          } ${touched && repoUrl && !isLocked ? (isValid ? 'border-wharf-green/50' : 'border-wharf-error/50') : ''}`}
          readOnly={isLocked}
          disabled={isLocked}
        />

        {/* Validation Indicator */}
        {touched && repoUrl && !isLocked && (
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

      {isLocked ? (
        <div className="flex items-center gap-1.5 px-3 h-8 border-2 border-wharf-border-secondary bg-wharf-surface-primary whitespace-nowrap">
          <Lock className="w-3 h-3 text-wharf-text-tertiary" />
          <span className="font-mono text-[10px] text-wharf-text-tertiary">New Chat To Change</span>
        </div>
      ) : (
        <Button
          variant="primary"
          size="sm"
          onClick={handleAnalyze}
          loading={isAnalyzing}
          disabled={isButtonDisabled}
          className="whitespace-nowrap h-8"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      )}
    </div>
  );
};
