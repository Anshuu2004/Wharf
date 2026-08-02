import { useState, useEffect, useCallback } from 'react';
import { Badge, Button, Card, Input, useToast } from '../ui';
import {
  FileText,
  Clock,
  Trash,
  Download,
  Copy,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  GitBranch,
  AlertTriangle,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface ChangelogHistoryItem {
  id: string;
  repoUrl: string;
  repoName: string;
  commitCount: number;
  generatedAt: string;
  format: string;
  owner?: string;
  description?: string;
  content?: string;
}

interface ChangelogHistoryProps {
  onSelect?: (content: string) => void;
  onCopy?: (content: string) => void;
  onBack?: () => void;
  onCountChange?: (count: number) => void;
}

export const ChangelogHistory = ({ onCopy, onBack, onCountChange }: ChangelogHistoryProps) => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<ChangelogHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ChangelogHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/changelog/history');
      const data = response.data;
      const historyData = data.data || [];
      setHistory(historyData);
      setFilteredHistory(historyData);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Failed to load history. Please try again.');
      showToast('Failed To Load History', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [user, fetchHistory]);

  // Filter & Sort
  useEffect(() => {
    let result = [...history];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (record) =>
          record.repoName.toLowerCase().includes(query) ||
          record.repoUrl.toLowerCase().includes(query) ||
          record.format.toLowerCase().includes(query) ||
          record.owner?.toLowerCase().includes(query) ||
          record.description?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort(
          (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime()
        );
        break;
      case 'alphabetical':
        result.sort((a, b) => a.repoName.localeCompare(b.repoName));
        break;
    }

    setFilteredHistory(result);

    if (onCountChange) {
      onCountChange(result.length);
    }
  }, [history, searchQuery, sortBy, onCountChange]);

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleCopy = async (content: string, repoName: string) => {
    try {
      if (onCopy) {
        onCopy(content);
      } else {
        await navigator.clipboard.writeText(content);
        showToast(`Copied ${repoName} changelog to clipboard!`, 'success');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = (content: string, repoName: string, format: string) => {
    try {
      const fileExtension = format === 'json' ? 'json' : 'md';
      const blob = new Blob([content], { 
        type: format === 'json' ? 'application/json' : 'text/markdown' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${repoName}-CHANGELOG.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloading ${repoName} changelog`, 'success');
    } catch (error) {
      console.error('Failed to download:', error);
      showToast('Failed to download changelog', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFormatColor = (format: string) => {
    const colors: Record<string, string> = {
      'keep-a-changelog': 'bg-yellow-500',
      simple: 'bg-wharf-green-dark',
      json: 'bg-wharf-purple-darker',
      default: 'bg-wharf-text-secondary',
    };
    return colors[format.toLowerCase()] || colors.default;
  };

  

  const getInitials = (repoName: string) => {
    return repoName.charAt(0).toUpperCase();
  };


  const handleRetry = () => {
    fetchHistory();
  };

  if (!user) {
    return (
      <Card variant="hard" className="p-16 text-center rounded-3xl">
        <FileText className="w-12 h-12 text-wharf-text-tertiary mx-auto mb-4 opacity-50" />
        <h3 className="font-display font-black text-2xl tracking-tighter mb-2">Sign In Required</h3>
        <p className="font-mono text-sm text-wharf-text-tertiary max-w-md mx-auto capitalize">
          Please sign in to view your changelog history...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-cyan-darker transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back To Dashboard
          </button>
          <Badge variant="cyan" className="gap-1">
            <FileText className="w-3 h-3" />
            {filteredHistory.length} Records
          </Badge>
        </div>
      )}

      {/* Title Section */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter">
          Changelog <span className="text-wharf-cyan-darker">History</span>
        </h2>
        <p className="font-mono text-md text-wharf-text-tertiary mb-10 capitalize">
          Review & reuse your previously generated changelogs...
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
          <Input
            placeholder="Search by repository, format, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-mono text-sm rounded-2xl"
            aria-label="Search changelogs"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-wharf-border-primary font-mono text-sm font-bold hover:bg-wharf-surface-secondary transition-colors rounded-2xl cursor-pointer"
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 border-2 border-wharf-border-primary font-mono text-sm font-bold bg-wharf-surface-primary focus:outline-none focus:border-wharf-cyan rounded-2xl cursor-pointer"
            aria-label="Sort changelogs"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Filter Tags */}
      {showFilters && (
        <div className="p-4 border-2 border-wharf-border-primary bg-wharf-surface-secondary animate-fadeInUp rounded-2xl">
          <div className="flex flex-wrap gap-2">
            <span className="font-mono text-xs font-bold text-wharf-text-tertiary">Formats:</span>
            {[...new Set(history.map((h) => h.format).filter((f): f is string => !!f))].map((format) => (
              <button
                key={format}
                onClick={() => {
                  if (searchQuery.includes(format)) {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(format);
                  }
                }}
                className={`px-2 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-cyan transition-colors cursor-pointer ${
                  searchQuery.includes(format) ? 'bg-wharf-cyan border-wharf-border-primary' : ''
                }`}
                aria-label={`Filter by ${format}`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card variant="hard" className="p-8 text-center rounded-3xl border-wharf-error">
          <AlertTriangle className="w-12 h-12 text-wharf-error mx-auto mb-4" />
          <h3 className="font-display font-black text-2xl tracking-tighter mb-2">Something Went Wrong</h3>
          <p className="font-mono text-sm text-wharf-text-secondary max-w-md mx-auto mb-4">
            {error}
          </p>
          <Button variant="cyan" size="sm" onClick={handleRetry}>
            Try Again
          </Button>
        </Card>
      )}

      {/* History Grid */}
      {!error && (
        <>
          {loading ? (
            // Skeleton Loading
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((index) => (
                <Card
                  key={index}
                  variant="hard"
                  className="p-0 overflow-hidden rounded-3xl animate-pulse"
                >
                  <div className="h-1 bg-wharf-border-secondary" />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-wharf-border-secondary rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-wharf-border-secondary rounded w-3/4" />
                        <div className="flex gap-2">
                          <div className="h-3 bg-wharf-border-secondary rounded w-16" />
                          <div className="h-3 bg-wharf-border-secondary rounded w-20" />
                        </div>
                      </div>
                      <div className="h-5 bg-wharf-border-secondary rounded w-16 flex-shrink-0" />
                    </div>
                    <div className="flex gap-3 pt-3 border-t-2 border-wharf-border-secondary">
                      <div className="h-8 bg-wharf-border-secondary rounded flex-1" />
                      <div className="h-8 bg-wharf-border-secondary rounded flex-1" />
                      <div className="h-8 w-8 bg-wharf-border-secondary rounded" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <Card variant="hard" className="p-16 text-center rounded-3xl">
              <div className="w-20 h-20 bg-wharf-surface-secondary border-2 border-wharf-border-primary flex items-center justify-center mx-auto mb-4 rounded-2xl">
                <FileText className="w-10 h-10 text-wharf-text-tertiary opacity-50" />
              </div>
              <h3 className="font-display font-black text-2xl tracking-tighter mb-2">
                No History Found
              </h3>
              <p className="font-mono text-sm text-wharf-text-tertiary max-w-md mx-auto">
                {searchQuery
                  ? 'Try adjusting your search filters.'
                  : "You haven't generated any changelogs yet."}
              </p>
              {!searchQuery && onBack && (
                <Button variant="cyan" size="sm" className="mt-4" onClick={onBack}>
                  Generate Your First Changelog
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHistory.map((item) => (
                  <Card
                    key={item.id}
                    variant="hard"
                    className="p-0 overflow-hidden transition-all duration-300 hover:translate-y-[-4px] group rounded-3xl"
                  >
                    {/* Format Color Accent Bar */}
                    <div className={`h-1 ${getFormatColor(item.format)}`} />

                    <div className="p-4">
                      {/* Repository Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Avatar/Icon */}
                          <div className="w-10 h-10 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0 bg-wharf-surface-secondary rounded-lg">
                            <span className="font-display font-black text-base text-wharf-cyan-darker">
                              {getInitials(item.repoName)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-mono font-bold text-base truncate">{item.repoName}</h3>
                            <div className="flex flex-wrap items-center gap-6 mt-0.5">
                              <span className="flex items-center gap-1 font-mono text-[11px] text-wharf-text-tertiary">
                                <Clock className="w-3 h-3" />
                                {formatDate(item.generatedAt)}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-[11px] text-wharf-text-tertiary">
                                <GitBranch className="w-3 h-3" />
                                {item.commitCount} Commits
                              </span>
                              {item.owner && (
                                <span className="font-mono text-[11px] text-wharf-text-tertiary truncate max-w-[120px]">
                                  {item.owner}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-wharf-border-secondary">
                        <Button
                          variant="primary"
                          size="sm"
                          rounded="md"
                          onClick={() => handleCopy(item.repoUrl, item.repoName)}
                          className="flex-1 min-w-[50px] h-8 group/btn text-xs"
                          aria-label={`Copy ${item.repoName} changelog`}
                        >
                          <Copy className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                          <span className="hidden sm:inline text-xs">Copy</span>
                        </Button>
                        <Button
                          variant="cyan"
                          size="sm"
                          rounded="md"
                          onClick={() => handleDownload(item.repoUrl, item.repoName, item.format)}
                          className="flex-1 min-w-[50px] h-8 group/btn text-xs"
                          aria-label={`Download ${item.repoName} changelog`}
                        >
                          <Download className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          <span className="hidden sm:inline text-xs">Download</span>
                        </Button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.75 text-wharf-text-primary hover:text-wharf-error bg-wharf-surface-tertiary hover:bg-wharf-error/10 transition-all border-2 border-wharf-border-primary hover:border-wharf-error rounded-lg cursor-pointer"
                          aria-label={`Delete ${item.repoName} changelog`}
                          disabled={isDeleting}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Footer Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 my-8 mb-16 pt-4 border-t-2 border-wharf-border-secondary font-mono text-xs text-wharf-text-secondary capitalize">
                <span>
                  Showing {filteredHistory.length} of {history.length} records
                </span>
                <span>
                  {history.length} total changelog{history.length !== 1 ? 's' : ''}
                </span>
              </div>
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div 
            className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-6 max-w-sm w-full shadow-brutal animate-scaleIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-wharf-error" />
              <h3 id="delete-dialog-title" className="font-display font-bold text-lg">
                Delete Record?
              </h3>
            </div>
            <p className="text-sm font-mono text-wharf-text-secondary mb-6">
              Are you sure you want to delete this changelog record? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetId = confirmDeleteId;
                  if (!targetId) return;
                  
                  // Save Current State For Potential Rollback
                  const prevHistory = [...history];
                  
                  // Optimistic UI Update - Immediately Remove The Item
                  setHistory((h) => h.filter((item) => item.id !== targetId));
                  setConfirmDeleteId(null);
                  setIsDeleting(true);
                  
                  try {
                    await api.delete(`/changelog/${targetId}`);
                    showToast('Deleted changelog from history', 'info');
                  } catch (error) {
                    // Rollback On Failure
                    setHistory(prevHistory);
                    showToast('Failed to delete record, restoring...', 'error');
                    console.error('Delete failed:', error);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 border-2 border-wharf-border-primary bg-wharf-error text-wharf-white font-mono text-xs font-bold hover:bg-wharf-error/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};