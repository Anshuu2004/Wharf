import { useState, useEffect } from 'react';
import { BarChart3, Zap, FileText, MessageSquare, User, Clock } from 'lucide-react';
import { Card, Badge } from '../ui';
import api from '../../lib/api';
import { UserHeatmap } from './UserHeatmap';

interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  readmesGenerated: number;
  chats: number;
  profilesGenerated: number;
  healthChecks: number;
  changelogsGenerated: number;
  lastActive: string;
  heatmapData: { date: string; count: number }[];
}

export const UsageTab = () => {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await api.get('/user/usage');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center animate-pulse">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-wharf-border-secondary rounded" />
              <div className="h-6 bg-wharf-border-secondary rounded w-40" />
            </div>
            <div className="h-4 bg-wharf-border-secondary rounded w-64" />
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <div className="h-6 bg-wharf-border-secondary rounded w-32" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-3xl p-6 text-center animate-pulse"
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-wharf-border-secondary rounded-lg mb-3" />
                <div className="h-8 bg-wharf-border-secondary rounded w-16 mb-1" />
                <div className="h-3 bg-wharf-border-secondary rounded w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Summary Skeleton */}
        <div className="p-4 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-2xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-wharf-border-secondary rounded w-32" />
              <div className="h-3 bg-wharf-border-secondary rounded w-64" />
            </div>
            <div className="hidden md:flex h-6 bg-wharf-border-secondary rounded w-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-wharf-text-secondary capitalize">No usage data available...</p>
      </div>
    );
  }

  const statItems = [
    { label: 'Total Requests', value: stats.totalRequests, icon: Zap, color: 'bg-wharf-pink' },
    {
      label: 'Tokens Used',
      value: stats.totalTokens.toLocaleString(),
      icon: BarChart3,
      color: 'bg-wharf-cyan',
    },
    { label: 'READMEs', value: stats.readmesGenerated, icon: FileText, color: 'bg-wharf-green' },
    { label: 'Chats', value: stats.chats, icon: MessageSquare, color: 'bg-wharf-purple' },
    { label: 'Profiles', value: stats.profilesGenerated, icon: User, color: 'bg-wharf-yellow' },
    {
      label: 'Health Checks',
      value: stats.healthChecks,
      icon: BarChart3,
      color: 'bg-wharf-orange',
    },
    { label: 'Changelogs', value: stats.changelogsGenerated, icon: Clock, color: 'bg-wharf-teal' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-wharf-pink-dark" />
            <h3 className="font-display font-black text-lg tracking-tighter">Usage Overview</h3>
          </div>
          <p className="font-mono text-sm text-wharf-text-secondary mt-1 capitalize">
            Your activity across all WHARF features
          </p>
        </div>
        <Badge variant="cyan" className="hidden md:flex gap-1.5">
          <Clock className="w-3 h-3" />
          Last active: {new Date(stats.lastActive).toLocaleDateString()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statItems.map((item) => (
          <Card key={item.label} variant="hard-sm" rounded="3xl" className="text-center">
            <div
              className={`w-10 h-10 ${item.color} border-2 border-wharf-border-primary flex items-center justify-center mb-3 mx-auto rounded-lg`}
            >
              <item.icon className="w-5 h-5 text-wharf-black" />
            </div>
            <div className="font-display font-black text-2xl tracking-tighter">{item.value}</div>
            <div className="font-mono text-xs text-wharf-text-secondary mt-1">{item.label}</div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 border-2 border-wharf-border-secondary bg-wharf-surface-secondary rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm font-bold text-wharf-text-secondary">Total Activity</p>
            <p className="font-mono text-xs text-wharf-text-secondary capitalize">
              {stats.readmesGenerated +
                stats.chats +
                stats.profilesGenerated +
                stats.healthChecks +
                stats.changelogsGenerated}{' '}
              actions across all features
            </p>
          </div>
          <Badge variant="pink">Free Plan</Badge>
        </div>
      </div>

      {stats.heatmapData && <UserHeatmap data={stats.heatmapData} />}
    </div>
  );
};
