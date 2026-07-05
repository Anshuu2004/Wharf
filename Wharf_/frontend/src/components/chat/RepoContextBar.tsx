import { Link2, Lock } from 'lucide-react';
import { Button, Input } from '../ui';

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
  return (
    <div className="flex items-center gap-3 h-full">
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isLocked ? (
            <Lock className="w-3.5 h-3.5 text-wharf-pink" />
          ) : (
            <Link2 className="w-4 h-4 text-wharf-text-tertiary" />
          )}
        </div>
        <Input
          placeholder="https://github.com/owner/repo"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className={`pl-9 font-mono text-sm h-8 ${isLocked ? 'opacity-60 cursor-not-allowed select-none' : ''}`}
          readOnly={isLocked}
          disabled={isLocked}
        />
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
          onClick={onAnalyze}
          loading={isAnalyzing}
          className="whitespace-nowrap h-8"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      )}
    </div>
  );
};
