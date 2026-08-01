import { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  GitFork,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Activity,
  Star,
  GitBranch,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, Input, useToast } from '../ui';
import api from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { motion } from 'framer-motion';

interface HistoryRecord {
  id: string;
  repoUrl: string;
  repoName: string;
  score: number;
  checkedAt: string;
  owner?: string;
  description?: string;
  stars?: number;
  forks?: number;
  issues?: number;
  lastCommit?: string;
  content?: string;
}

interface HealthHistoryProps {
  onSelect?: (repoUrl: string) => void;
  onBack?: () => void;
  onCountChange?: (count: number) => void;
}

export const HealthHistory = ({ onSelect, onBack, onCountChange }: HealthHistoryProps) => {
  const { isAuthenticated } = useAuthStore();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedScoreRange, setSelectedScoreRange] = useState<'all' | 'high' | 'medium' | 'low'>(
    'all'
  );
  const { showToast } = useToast();

  const fetchHistory = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/health/history');
      const data = response.data.data || [];
      setHistory(data);
      setFilteredHistory(data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError('Failed to load health history. Please try again.');
      showToast('Failed to load history', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchHistory]);

  // Filter & Sort
  useEffect(() => {
    let result = [...history];

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (record) =>
          record.repoName.toLowerCase().includes(query) ||
          record.owner?.toLowerCase().includes(query) ||
          record.description?.toLowerCase().includes(query) ||
          record.repoUrl.toLowerCase().includes(query)
      );
    }

    // Score Range Filter
    if (selectedScoreRange !== 'all') {
      result = result.filter((record) => {
        if (selectedScoreRange === 'high') return record.score >= 80;
        if (selectedScoreRange === 'medium') return record.score >= 60 && record.score < 80;
        if (selectedScoreRange === 'low') return record.score < 60;
        return true;
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime());
        break;
      case 'highest':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'lowest':
        result.sort((a, b) => a.score - b.score);
        break;
    }

    setFilteredHistory(result);

    if (onCountChange) {
      onCountChange(result.length);
    }
  }, [history, searchQuery, sortBy, selectedScoreRange, onCountChange]);

  const handleDelete = (id: string, _repoName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleView = (repoUrl: string) => {
    if (onSelect) {
      onSelect(repoUrl);
    }
  };

  const handleRetry = () => {
    fetchHistory();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-wharf-green-dark';
    if (score >= 60) return 'text-wharf-yellow-dark';
    return 'text-wharf-error';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-wharf-green/20 border-wharf-green';
    if (score >= 60) return 'bg-wharf-yellow/20 border-wharf-yellow';
    return 'bg-wharf-error/20 border-wharf-error';
  };

  const getScoreRangeLabel = (range: string) => {
    switch (range) {
      case 'high':
        return 'High (80-100)';
      case 'medium':
        return 'Medium (60-79)';
      case 'low':
        return 'Low (0-59)';
      default:
        return 'All Scores';
    }
  };

  if (!isAuthenticated) {
    return (
      <Card variant="hard" className="p-16 text-center rounded-3xl">
        <Activity className="w-12 h-12 text-wharf-text-tertiary mx-auto mb-4 opacity-50" />
        <h3 className="font-display font-black text-2xl tracking-tighter mb-2">Sign In Required</h3>
        <p className="font-mono text-sm text-wharf-text-tertiary max-w-md mx-auto capitalize">
          Please sign in to view your health history...
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
            className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-green transition-colors group cursor-pointer"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back To Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-wharf-green" />
              <span className="font-mono text-xs text-wharf-text-tertiary">
                {filteredHistory.filter((r) => r.score >= 80).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-wharf-yellow" />
              <span className="font-mono text-xs text-wharf-text-tertiary">
                {filteredHistory.filter((r) => r.score >= 60 && r.score < 80).length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-wharf-error" />
              <span className="font-mono text-xs text-wharf-text-tertiary">
                {filteredHistory.filter((r) => r.score < 60).length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Title Section */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter">
          Health <span className="text-wharf-green-darker">History</span>
        </h2>
        <p className="font-mono text-md text-wharf-text-tertiary mb-10 capitalize">
          Review & re-analyze your previously checked repositories...
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
          <Input
            placeholder="Search by repo name, owner, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-mono text-sm rounded-2xl"
            aria-label="Search health records"
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
            className="px-4 py-2 border-2 border-wharf-border-primary font-mono text-sm font-bold bg-wharf-surface-primary focus:outline-none focus:border-wharf-green rounded-2xl cursor-pointer"
            aria-label="Sort health records"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Filter Tags */}
      {showFilters && (
        <div className="p-4 border-2 border-wharf-border-primary bg-wharf-surface-secondary animate-fadeInUp rounded-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-xs font-bold text-wharf-text-tertiary">
              Score Range:
            </span>
            {['all', 'high', 'medium', 'low'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedScoreRange(range as typeof selectedScoreRange)}
                className={`px-3 py-1 border border-wharf-border-secondary font-mono text-xs transition-colors cursor-pointer rounded-full ${
                  selectedScoreRange === range
                    ? 'bg-wharf-green/80 border-wharf-green'
                    : 'hover:border-wharf-green'
                }`}
                aria-label={`Filter by ${getScoreRangeLabel(range)}`}
              >
                {getScoreRangeLabel(range)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card variant="hard" className="p-8 text-center rounded-3xl border-wharf-error">
          <AlertTriangle className="w-12 h-12 text-wharf-error mx-auto mb-4" />
          <h3 className="font-display font-black text-2xl tracking-tighter mb-2">
            Something Went Wrong
          </h3>
          <p className="font-mono text-sm text-wharf-text-secondary max-w-md mx-auto mb-4">
            {error}
          </p>
          <Button variant="green" size="sm" onClick={handleRetry}>
            Try Again
          </Button>
        </Card>
      )}

      {/* History Grid */}
      {!error && (
        <>
          {isLoading ? (
            // Loading Skeleton Cards
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card
                  key={index}
                  variant="hard"
                  className="p-0 overflow-hidden rounded-3xl animate-pulse"
                >
                  <div className="h-1 bg-wharf-border-secondary" />
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-wharf-border-secondary rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-wharf-border-secondary rounded w-3/4" />
                        <div className="flex gap-2">
                          <div className="h-3 bg-wharf-border-secondary rounded w-16" />
                          <div className="h-3 bg-wharf-border-secondary rounded w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t-2 border-wharf-border-secondary">
                      <div className="flex gap-3">
                        <div className="h-3 bg-wharf-border-secondary rounded w-12" />
                        <div className="h-3 bg-wharf-border-secondary rounded w-12" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 bg-wharf-border-secondary rounded w-16" />
                        <div className="h-8 w-8 bg-wharf-border-secondary rounded" />
                      </div>
                    </div>
                    <div className="mt-2 h-3 bg-wharf-border-secondary rounded w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <Card variant="hard" className="p-16 text-center rounded-3xl">
              <div className="w-20 h-20 bg-wharf-surface-secondary border-2 border-wharf-border-primary flex items-center justify-center mx-auto mb-4 rounded-2xl">
                <Activity className="w-10 h-10 text-wharf-text-tertiary opacity-50" />
              </div>
              <h3 className="font-display font-black text-2xl tracking-tighter mb-2">
                No History Found
              </h3>
              <p className="font-mono text-sm text-wharf-text-tertiary max-w-md mx-auto">
                {searchQuery || selectedScoreRange !== 'all'
                  ? 'Try adjusting your search filters.'
                  : "You haven't analyzed any repositories yet."}
              </p>
              {!searchQuery && selectedScoreRange === 'all' && onBack && (
                <Button variant="green" size="sm" className="mt-4" onClick={onBack}>
                  Analyze Your First Repository
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredHistory.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      variant="hard"
                      className="p-0 overflow-hidden transition-all duration-300 hover:translate-y-[-4px] group rounded-3xl"
                    >
                      {/* Score Color Accent Bar */}
                      <div className={`h-1 ${getScoreColor(record.score).replace('text-', 'bg-')}`} />

                      <div className="p-4">
                        {/* Score & Repo Info */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Score Circle */}
                            <div
                              className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center flex-shrink-0 ${getScoreBgColor(record.score)}`}
                            >
                              <span
                                className={`font-display font-black text-lg leading-none ${getScoreColor(record.score)}`}
                              >
                                {record.score}
                              </span>
                              <span className="font-mono text-[8px] text-wharf-text-tertiary uppercase tracking-wider">
                                Score
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-mono font-bold text-base truncate">
                                  {record.repoName}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mt-0.5">
                                <span className="font-mono text-xs text-wharf-text-tertiary flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(record.checkedAt)}
                                </span>
                                {record.owner && (
                                  <span className="font-mono text-xs text-wharf-text-tertiary flex items-center gap-1">
                                    <GitFork className="w-3 h-3" />
                                    {record.owner}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between pt-3 border-t-2 border-wharf-border-secondary">
                          <div className="flex items-center gap-4">
                            {record.stars !== undefined && (
                              <span className="flex items-center gap-1 font-mono text-xs text-wharf-text-tertiary">
                                <Star className="w-3.5 h-3.5" />
                                {record.stars}
                              </span>
                            )}
                            {record.forks !== undefined && (
                              <span className="flex items-center gap-1 font-mono text-xs text-wharf-text-tertiary">
                                <GitBranch className="w-3.5 h-3.5" />
                                {record.forks}
                              </span>
                            )}
                            {record.issues !== undefined && (
                              <span className="flex items-center gap-1 font-mono text-xs text-wharf-text-tertiary">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {record.issues}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              variant="green"
                              size="sm"
                              rounded="md"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleView(record.repoUrl);
                              }}
                              className="h-8 text-xs cursor-pointer"
                              aria-label={`Re-analyze ${record.repoName}`}
                            >
                              <span className="inline text-xs">Re-analyze</span>
                            </Button>
                            <button
                              onClick={(e) => handleDelete(record.id, record.repoName, e)}
                              className="p-1.75 text-wharf-text-primary hover:text-wharf-error bg-wharf-surface-tertiary hover:bg-wharf-error/10 transition-all border-2 border-wharf-border-primary hover:border-wharf-error rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={isDeleting}
                              aria-label={`Delete ${record.repoName} record`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        {record.description && (
                          <p className="mt-2 font-mono text-xs text-wharf-text-tertiary line-clamp-2">
                            {record.description}
                          </p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Footer Stats */}
              <div className="flex flex-wrap items-center justify-between gap-2 my-8 pt-4 border-t-2 border-wharf-border-secondary font-mono text-xs text-wharf-text-secondary capitalize">
                <span>
                  Showing {filteredHistory.length} of {history.length} records
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-wharf-green" />
                    High: {history.filter((r) => r.score >= 80).length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-wharf-yellow" />
                    Medium: {history.filter((r) => r.score >= 60 && r.score < 80).length}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-wharf-error" />
                    Low: {history.filter((r) => r.score < 60).length}
                  </span>
                </div>
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
              Are you sure you want to delete this repository record? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:bg-wharf-surface-secondary transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    await api.delete(`/health/history/${targetId}`);
                    showToast('Deleted record from history', 'info');
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