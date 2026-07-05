import { useState, useEffect } from 'react';
import { Badge, Button, Card, Input, useToast } from '../ui';
import {
  FileText,
  Clock,
  Trash,
  Eye,
  Download,
  Copy,
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  LayoutTemplate,
} from 'lucide-react';
import api from '../../lib/api';

interface ProfileHistoryItem {
  id: string;
  username: string;
  content: string;
  template: string;
  generatedAt: string;
  stars?: number;
  forks?: number;
  bio?: string;
  avatarUrl?: string;
}

interface ProfileHistoryViewProps {
  onSelect?: (content: string) => void;
  onCopy?: (content: string) => void;
  onBack?: () => void;
  onCountChange?: (count: number) => void;
}

export const ProfileHistoryView = ({
  onSelect,
  onCopy,
  onBack,
  onCountChange,
}: ProfileHistoryViewProps) => {
  const [history, setHistory] = useState<ProfileHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ProfileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/profile/history');
        if (res.data?.success) {
          const historicalData = res.data.data;
          const data = Array.isArray(historicalData) ? historicalData : [];
          setHistory(data);
          setFilteredHistory(data);
        }
      } catch {
        showToast('Failed to load history', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [showToast]);

  // Filter & Sort
  useEffect(() => {
    let result = [...history];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (record) =>
          record.username.toLowerCase().includes(query) ||
          record.template.toLowerCase().includes(query) ||
          record.bio?.toLowerCase().includes(query)
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
        result.sort((a, b) => a.username.localeCompare(b.username));
        break;
    }

    setFilteredHistory(result);

    if (onCountChange) {
      onCountChange(result.length);
    }
  }, [history, searchQuery, sortBy, onCountChange]);

  const handleDelete = async (id: string, username: string) => {
    try {
      await api.delete(`/profile/${id}`);
      setHistory((h) => h.filter((item) => item.id !== id));
      showToast(`Deleted ${username} from history`, 'info');
    } catch {
      showToast('Failed to delete record', 'error');
    }
  };

  const handleCopy = async (content: string, username: string) => {
    if (onCopy) {
      onCopy(content);
    } else {
      await navigator.clipboard.writeText(content);
      showToast(`Copied ${username} profile to clipboard!`, 'success');
    }
  };

  const handleDownload = (content: string, username: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-README.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${username} profile`, 'success');
  };

  const handleView = (content: string) => {
    if (onSelect) {
      onSelect(content);
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

  const getTemplateColor = (template: string) => {
    const colors: Record<string, string> = {
      minimal: 'bg-wharf-cyan-darker',
      professional: 'bg-wharf-purple-darker',
      creative: 'bg-wharf-pink-darker',
      developer: 'bg-wharf-orange-darker',
      terminal: 'bg-wharf-green-dark',
      modern: 'bg-wharf-teal-darker',
      default: 'bg-wharf-text-secondary',
    };
    return colors[template.toLowerCase()] || colors.default;
  };

  const getTemplateBadgeVariant = (
    template: string
  ): 'cyan' | 'purple' | 'pink' | 'green' | 'teal' | 'default' => {
    const variants: Record<string, 'cyan' | 'purple' | 'pink' | 'green' | 'teal' | 'default'> = {
      minimal: 'cyan',
      professional: 'purple',
      creative: 'pink',
      developer: 'default',
      terminal: 'green',
      modern: 'teal',
      default: 'default',
    };
    return variants[template.toLowerCase()] || 'default';
  };

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Header */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-mono text-sm font-bold text-wharf-text-secondary hover:text-wharf-pink transition-colors group capitalize"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back To Dashboard
          </button>
          <Badge variant="cyan" className="gap-1">
            <FileText className="w-3 h-3" />
            {filteredHistory.length} records
          </Badge>
        </div>
      )}

      {/* Title Section */}
      <div className="space-y-4">
        <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter">
          Profile <span className="text-wharf-pink">History</span>
        </h2>
        <p className="font-mono text-md text-wharf-text-tertiary mb-10 capitalize">
          Review & reuse your previously generated profile READMEs...
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wharf-text-tertiary" />
          <Input
            placeholder="Search by username, template, or bio..."
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
            <span className="font-mono text-xs font-bold text-wharf-text-tertiary">Templates:</span>
            {[...new Set(history.map((h) => h.template).filter(Boolean))].map((template) => (
              <button
                key={template}
                onClick={() => {
                  if (searchQuery.includes(template)) {
                    setSearchQuery('');
                  } else {
                    setSearchQuery(template);
                  }
                }}
                className={`px-2 border border-wharf-border-secondary font-mono text-xs hover:border-wharf-pink transition-colors cursor-pointer ${
                  searchQuery.includes(template) ? 'bg-wharf-pink border-wharf-border-primary' : ''
                }`}
              >
                {template}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading & Empty State */}
      {loading ? (
        <div className="p-16 text-center border-2 border-wharf-border-primary rounded-3xl">
          <div className="w-10 h-10 border-4 border-wharf-pink border-t-transparent animate-spin mx-auto" />
          <p className="font-mono text-sm text-wharf-text-tertiary mt-4">Loading Your History...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card variant="hard" className="p-16 text-center">
          <div className="w-20 h-20 bg-wharf-surface-secondary border-2 border-wharf-border-primary flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-wharf-text-tertiary opacity-50" />
          </div>
          <h3 className="font-display font-black text-2xl tracking-tighter mb-2">
            No History Found
          </h3>
          <p className="font-mono text-sm text-wharf-text-tertiary max-w-md mx-auto">
            {searchQuery
              ? 'Try Adjusting Your Search Filters.'
              : "You Haven't Generated Any Profile READMEs Yet..."}
          </p>
          {!searchQuery && onBack && (
            <Button variant="primary" size="sm" className="mt-4" onClick={onBack}>
              Create Your First Profile README
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* History Grid - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHistory.map((item) => (
              <Card
                key={item.id}
                variant="hard"
                className="p-0 overflow-hidden transition-all duration-300 hover:translate-y-[-4px] group rounded-3xl"
              >
                {/* Template Color Accent Bar */}
                <div className={`h-1 ${getTemplateColor(item.template)}`} />

                <div className="p-4">
                  {/* Profile Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="w-10 h-10 border-2 border-wharf-border-primary flex items-center justify-center flex-shrink-0 bg-wharf-surface-secondary overflow-hidden">
                        {item.avatarUrl || item.username ? (
                          <img
                            src={item.avatarUrl || `https://github.com/${item.username}.png`}
                            alt={item.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-display font-black text-base text-wharf-pink">
                            {getInitials(item.username)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-mono font-bold text-base truncate">{item.username}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-mono text-[11px] text-wharf-text-tertiary">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.generatedAt)}
                          </span>
                          {item.bio && (
                            <span className="font-mono text-[11px] text-wharf-text-tertiary truncate max-w-[120px]">
                              {item.bio}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Template Badge */}
                    <Badge
                      variant={getTemplateBadgeVariant(item.template)}
                      className="flex items-center gap-1 flex-shrink-0 ml-2 text-[10px] px-2 py-0.5"
                    >
                      <LayoutTemplate className="w-3 h-3" />
                      {item.template}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t-2 border-wharf-border-secondary">
                    <Button
                      variant="secondary"
                      size="sm"
                      rounded="md"
                      onClick={() => handleCopy(item.content, item.username)}
                      className="flex-1 min-w-[50px] h-8 group/btn text-xs"
                    >
                      <Copy className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                      <span className="hidden sm:inline text-xs">Copy</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      rounded="md"
                      onClick={() => handleDownload(item.content, item.username)}
                      className="flex-1 min-w-[50px] h-8 group/btn text-xs"
                    >
                      <Download className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      <span className="hidden sm:inline text-xs">Download</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      rounded="md"
                      onClick={() => handleView(item.content)}
                      className="flex-1 min-w-[50px] h-8 text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-xs">View</span>
                    </Button>
                    <button
                      onClick={() => handleDelete(item.id, item.username)}
                      className="p-1.75 text-wharf-text-primary hover:text-wharf-error bg-wharf-surface-tertiary hover:bg-wharf-error/10 transition-all border-2 border-wharf-border-primary hover:border-wharf-error rounded-lg"
                      title="Delete"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="flex flex-wrap items-center justify-between gap-2 my-8 pt-4 border-t-2 border-wharf-border-secondary font-mono text-xs text-wharf-text-secondary capitalize">
            <span className="capitalize">
              Showing {filteredHistory.length} of {history.length} records
            </span>
            <span>
              {history.length} total profile{history.length !== 1 ? 's' : ''}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
