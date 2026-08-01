import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Star, GitFork, RefreshCw } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Badge } from '../ui/Badge';
import api from '../../lib/api';

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface Repo {
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
}

interface RepoSelectorProps {
  user: User | null;
  onSelect: (repo: Repo) => void;
}

export const RepoSelector = ({ user, onSelect }: RepoSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      fetchUserRepos();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Focus Search Input When Dropdown Opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close Dropdown On Outside Click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserRepos = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/user/repos');
      if (response.data && response.data.success) {
        setRepos(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user repos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRepos = async () => {
    setIsRefreshing(true);
    await fetchUserRepos();
    setIsRefreshing(false);
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-wharf-yellow',
      TypeScript: 'bg-wharf-cyan-darker',
      Python: 'bg-wharf-cyan-darker',
      Java: 'bg-wharf-error',
      Go: 'bg-wharf-green-darker',
      Rust: 'bg-wharf-purple-darker',
      'C++': 'bg-wharf-cyan-darker',
      'C#': 'bg-wharf-purple-darker',
      Ruby: 'bg-wharf-error',
      PHP: 'bg-wharf-purple-darker',
      HTML: 'bg-wharf-error',
      CSS: 'bg-wharf-cyan-darker',
      Swift: 'bg-wharf-error',
      Kotlin: 'bg-wharf-error',
    };
    return colors[language] || 'bg-wharf-border-secondary';
  };

  // Skeleton Loading Items
  const SkeletonItem = () => (
    <div className="w-full p-3.5 border-b border-wharf-border-secondary last:border-b-0 animate-pulse">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-4 bg-wharf-border-secondary rounded w-48" />
          <div className="h-4 bg-wharf-border-secondary rounded w-12" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
            <div className="h-3 bg-wharf-border-secondary rounded w-8" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-wharf-border-secondary rounded" />
            <div className="h-3 bg-wharf-border-secondary rounded w-8" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-wharf-border-secondary rounded" />
          <div className="h-3 bg-wharf-border-secondary rounded w-16" />
        </div>
        <div className="h-3 bg-wharf-border-secondary rounded w-24" />
      </div>
    </div>
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!user}
        className="w-full flex items-center justify-between p-3.5 border-2 border-wharf-border-primary bg-wharf-surface-primary hover:bg-wharf-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <FaGithub className="w-4 h-4 flex-shrink-0" />
          <span className="font-mono text-sm truncate capitalize">
            {isLoading
              ? 'Loading repositories...'
              : user
                ? 'Select a repository'
                : 'Connect GitHub to continue'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {user && !isLoading && (
            <Badge variant="default" size="sm" className="hidden sm:inline-flex">
              {repos.length} repos
            </Badge>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-4 w-full z-10 transition-all duration-300 animate-fadeInUp">
          <div className="border-2 border-wharf-border-primary bg-wharf-surface-primary shadow-brutal">
            {/* Search & Actions Bar */}
            <div className="flex items-center gap-2 p-3 border-b-2 border-wharf-border-secondary bg-wharf-surface-secondary">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 font-mono text-sm border border-wharf-border-secondary bg-wharf-surface-primary focus:outline-none focus:border-wharf-pink"
                />
              </div>
              <button
                onClick={refreshRepos}
                disabled={isRefreshing}
                className="p-2 border border-wharf-border-secondary hover:border-wharf-pink hover:bg-wharf-pink/10 transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh repositories"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Repo List */}
            <div className="overflow-y-auto max-h-[320px] scrollbar-hidden">
              {isLoading ? (
                // Skeleton Loading
                <div className="divide-y divide-wharf-border-secondary">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SkeletonItem key={i} />
                  ))}
                </div>
              ) : !user ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 border-2 border-wharf-border-primary flex items-center justify-center mx-auto">
                    <FaGithub className="w-8 h-8 text-wharf-text-tertiary" />
                  </div>
                  <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                    Please connect your GitHub account to view repositories...
                  </p>
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/github`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-wharf-border-primary bg-wharf-pink font-mono text-sm font-bold hover:bg-wharf-pink-dark transition-colors"
                  >
                    <FaGithub className="w-4 h-4" />
                    Connect GitHub
                  </a>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 text-wharf-text-tertiary mx-auto mb-2 opacity-50" />
                  <p className="font-mono text-sm text-wharf-text-secondary capitalize">
                    {searchQuery ? 'No repositories match your search' : 'No repositories found'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 font-mono text-xs text-wharf-error hover:underline capitalize cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => {
                      onSelect(repo);
                      setIsOpen(false);
                    }}
                    className="w-full p-3.5 text-left hover:bg-wharf-surface-secondary transition-colors border-b border-wharf-border-secondary last:border-b-0 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-sm truncate">
                          {repo.full_name}
                        </span>
                        {repo.private && (
                          <Badge variant="default" size="sm" className="text-[8px]">
                            Private
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="flex items-center gap-1 text-xs text-wharf-text-tertiary">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-wharf-text-tertiary">
                          <GitFork className="w-3 h-3" />
                          {repo.forks}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {repo.language && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 ${getLanguageColor(repo.language)} border border-wharf-border-primary rounded-full`}
                          />
                          <span className="font-mono text-xs text-wharf-text-tertiary">
                            {repo.language}
                          </span>
                        </div>
                      )}
                      {repo.updated_at && (
                        <span className="font-mono text-[10px] text-wharf-text-tertiary/60">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer Stats */}
            {!isLoading && user && filteredRepos.length > 0 && (
              <div className="flex items-center justify-between px-3.5 py-2 border-t-2 border-wharf-border-secondary bg-wharf-surface-secondary">
                <span className="font-mono text-[10px] text-wharf-text-tertiary capitalize">
                  Showing {filteredRepos.length} of {repos.length} repositories
                </span>
                <span className="font-mono text-[10px] text-wharf-text-tertiary capitalize">
                  {repos.reduce((acc, r) => acc + r.stars, 0).toLocaleString()} total stars
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};