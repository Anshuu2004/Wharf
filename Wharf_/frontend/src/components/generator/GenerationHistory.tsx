import { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Eye,
  Copy,
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { Button, Badge, Card, Input, useToast } from '../ui';
import api from '../../lib/api';

interface GenerationRecord {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  repository: {
    name: string;
    owner: string;
    url: string;
    language: string;
    stars?: number;
    forks?: number;
  };
  wordCount?: number;
}

interface GenerationHistoryProps {
  onBack: () => void;
  onViewContent: (content: string) => void;
}

export const GenerationHistory = ({ onBack, onViewContent }: GenerationHistoryProps) => {
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<GenerationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/generate/history');
        if (res.data && res.data.success) {
          const data = res.data.data;
          setHistory(data);
          setFilteredHistory(data);
        }
      } catch {
        showToast('Failed to load history', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [showToast]);

  // Filter & Sort
  useEffect(() => {
    let result = [...history];

    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (record) =>
          record.repository.name.toLowerCase().includes(query) ||
          record.repository.owner.toLowerCase().includes(query) ||
          record.repository.language?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.repository.name.localeCompare(b.repository.name));
        break;
    }

    setFilteredHistory(result);
  }, [history, searchQuery, sortBy]);

  const fetchContent = async (id: string): Promise<string | null> => {
    try {
      const res = await api.get(`/generate/history/${id}`);
      if (res.data && res.data.success) {
        return res.data.data.content;
      }
      return null;
    } catch {
      showToast('Failed to fetch content', 'error');
      return null;
    }
  };

  const handleCopy = async (id: string, repoName: string) => {
    const content = await fetchContent(id);
    if (!content) return;
    navigator.clipboard.writeText(content);
    showToast(`Copied ${repoName} README to clipboard!`, 'success');
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDownload = async (id: string, repoName: string) => {
    const content = await fetchContent(id);
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repoName}-README.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${repoName} README`, 'success');
  };

  const handleView = async (id: string) => {
    const content = await fetchContent(id);
    if (!content) return;
    onViewContent(content);
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

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-wharf-yellow',
      TypeScript: 'bg-wharf-cyan',
      Python: 'bg-wharf-green',
      Java: 'bg-wharf-orange',
      Go: 'bg-wharf-cyan',
      Rust: 'bg-wharf-orange',
      'C++': 'bg-wharf-purple',
      'C#': 'bg-wharf-purple',
      Ruby: 'bg-wharf-pink',
      PHP: 'bg-wharf-purple',
      HTML: 'bg-wharf-orange',
      CSS: 'bg-wharf-pink',
      Swift: 'bg-wharf-orange',
      Kotlin: 'bg-wharf-purple',
    };
    return colors[language] || 'bg-wharf-border-secondary';
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-pink-dark transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back To Dashboard
        </button>
        <Badge variant="cyan" className="gap-1">
          <FileText className="w-3 h-3" />
          {filteredHistory.length} records
        </Badge>
      </div>

      {/* Title Section */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter">
          Documentation <span className="text-wharf-pink">History</span>
        </h2>
        <p className="font-mono text-md text-wharf-text-tertiary mb-10 capitalize">
          Review & reuse your previously generated READMEs
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
          <Input
            placeholder="Search by repo name, owner, or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-mono text-sm rounded-2xl"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-wharf-border-primary font-mono text-sm font-bold hover:bg-wharf-surface-secondary transition-colors rounded-2xl cursor-pointer"
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
            className="px-4 py-2 border-2 border-wharf-border-primary font-mono text-sm font-bold bg-wharf-surface-primary focus:outline-none focus:border-wharf-pink rounded-2xl cursor-pointer"
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
            <span className="font-mono text-xs font-bold text-wharf-text-tertiary">Languages:</span>
            {[...new Set(history.map((h) => h.repository.language).filter(Boolean))].map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  if (searchQuery.includes(lang || '')) {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(lang || '');
                  }
                }}
                className={`px-2 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-pink transition-colors cursor-pointer ${
                  searchQuery.includes(lang || '')
                    ? 'bg-wharf-pink border-wharf-border-primary'
                    : ''
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History List - Skeleton Loading or Content */}
      {isLoading ? (
        // Loading skeleton cards
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index} variant="hard" rounded="3xl" className="p-4 animate-pulse">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 bg-wharf-border-secondary rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-wharf-border-secondary rounded w-3/4" />
                      <div className="flex gap-3">
                        <div className="h-3 bg-wharf-border-secondary rounded w-16" />
                        <div className="h-3 bg-wharf-border-secondary rounded w-20" />
                        <div className="h-3 bg-wharf-border-secondary rounded w-12" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                  <div className="h-8 bg-wharf-border-secondary rounded w-16" />
                  <div className="h-8 bg-wharf-border-secondary rounded w-16" />
                  <div className="h-8 bg-wharf-border-secondary rounded w-16" />
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
              ? 'Try Adjusting Your Search Filters.'
              : "You Haven't Generated Any Documentation Yet..."}
          </p>
          {!searchQuery && (
            <Button variant="primary" size="sm" className="mt-4" onClick={onBack}>
              Create Your First README
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* History List */}
          <div className="grid gap-6">
            {filteredHistory.map((record) => (
              <Card
                key={record.id}
                variant="hard"
                rounded="3xl"
                className="p-4 hover:translate-y-[-2px] transition-all duration-200 group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left - Repo Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0 bg-wharf-surface-secondary rounded-lg">
                        <FaGithub className="w-5 h-5 text-wharf-text-primary" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold text-lg truncate">
                          {record.repository.owner}/{record.repository.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          {record.repository.language && (
                            <span className="flex items-center gap-1 font-mono text-xs">
                              <span
                                className={`w-2 h-2 ${getLanguageColor(record.repository.language)} border border-wharf-border-primary rounded-full`}
                              />
                              {record.repository.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-mono text-xs text-wharf-text-tertiary">
                            <Clock className="w-3 h-3" />
                            {formatDate(record.createdAt)}
                          </span>
                          {record.wordCount && (
                            <span className="font-mono text-xs text-wharf-text-tertiary">
                              {record.wordCount} words
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCopy(record.id, record.repository.name)}
                      className="group/btn"
                    >
                      <Copy className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(record.id, record.repository.name)}
                      className="group/btn"
                    >
                      <Download className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleView(record.id)}>
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="text-wharf-text-tertiary hover:text-wharf-orange hover:bg-transparent"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer Stats */}
          {filteredHistory.length > 0 && (
            <div className="flex justify-between items-center my-8 pt-4 border-t-2 border-wharf-border-secondary font-mono text-xs text-wharf-text-tertiary capitalize">
              <span>
                Showing {filteredHistory.length} of {history.length} records
              </span>
              <span>
                {history.reduce((acc, r) => acc + (r.wordCount || 0), 0).toLocaleString()} total
                words
              </span>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary p-6 max-w-sm w-full shadow-brutal animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-wharf-error" />
              <h3 className="font-display font-bold text-lg">Delete Record?</h3>
            </div>
            <p className="text-sm font-mono text-wharf-text-secondary mb-6">
              Are you sure you want to delete this generated README record? This action cannot be
              undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border-2 border-wharf-border-secondary font-mono text-xs font-bold hover:bg-wharf-surface-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetId = confirmDeleteId;
                  if (!targetId) return;
                  
                  // Optimistic Snap
                  const prev = [...history];
                  
                  // Instantly Update UI
                  setHistory((h) => h.filter((item) => item.id !== targetId));
                  setConfirmDeleteId(null); // Close Modal Instantly
                  
                  try {
                    await api.delete(`/generate/history/${targetId}`);
                    showToast('Deleted record from history', 'info');
                  } catch (_error) {
                    // Rollback On Failure
                    setHistory(prev);
                    showToast('Failed to delete record, restoring...', 'error');
                  }
                }}
                className="px-4 py-2 border-2 border-wharf-border-primary bg-wharf-error text-wharf-white font-mono text-xs font-bold hover:bg-wharf-error/80 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
