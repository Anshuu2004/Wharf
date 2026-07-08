import { useState } from 'react';
import { Link2, ArrowRight, GitBranch, Star, GitFork, AlertCircle, Zap, Info } from 'lucide-react';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && repoUrl.trim()) {
      onAnalyze();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    // Auto-Detect GitHub URL
    if (pastedText.includes('github.com')) {
      const match = pastedText.match(/github\.com\/([^/]+\/[^/\s]+)/);
      if (match) {
        setRepoUrl(`https://github.com/${match[1]}`);
        e.preventDefault();
      }
    }
  };

  const examples = [
    { name: 'facebook/react', stars: '222k', description: 'React UI library' },
    { name: 'vercel/next.js', stars: '120k', description: 'React framework' },
    { name: 'tailwindlabs/tailwindcss', stars: '78k', description: 'CSS framework' },
    { name: 'vuejs/vue', stars: '206k', description: 'Vue.js framework' },
  ];

  const isValidUrl = repoUrl.trim().includes('github.com') && repoUrl.trim().length > 0;

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
        <div className="flex flex-col md:flex-row gap-3 mt-6 mb-8">
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
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => {
                setIsFocused(true);
                if (recentRepos.length > 0) setShowRecent(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                setTimeout(() => setShowRecent(false), 200);
              }}
              className={`pl-12 font-mono text-sm transition-all duration-300 ${
                isFocused ? 'border-wharf-pink ring-2 ring-wharf-pink/20' : ''
              } ${isValidUrl && !isLoading ? 'border-wharf-green/50' : ''}`}
            />
          </div>

          <Button
            variant="primary"
            rounded="2xl"
            onClick={onAnalyze}
            loading={isLoading}
            disabled={!isValidUrl}
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

        {/* Quick Examples */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
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
                onClick={() => {
                  setRepoUrl(`https://github.com/${example.name}`);
                  setTimeout(onAnalyze, 100);
                }}
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
