import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout';
import {
  AdminHeader,
  AdminStats,
  AdminUsageChart,
  AdminProviderChart,
  AdminFeatureChart,
  AdminHeatmap,
  AdminTopUsers,
  AdminPopularRepos,
  AdminLiveFeed,
  AdminCacheStats,
  AdminCostEstimate,
  AdminAnomalyAlert,
  AdminNav,
  AdminTokenUsage,
} from '../components/admin';
import api from '../lib/api';

interface DashboardData {
  stats: {
    totalUsers: number;
    totalGenerations: number;
    activeUsers: number;
    successRate: number;
    avgResponseTime: number;
    cacheHitRate: number;
    estimatedCost: number;
  };
  usageData: { date: string; generations: number; users: number }[];
  providerData: { name: string; value: number }[];
  featureData: { name: string; value: number }[];
  heatmapData: { date: string; count: number }[]; // GitHub-style
  tokenData: { provider: string; tokens: number; color: string }[];
  topUsers: { username: string; generations: number; change: number }[];
  popularRepos: { name: string; generations: number; stars: number; change: number }[];
  recentActivity: { user: string; action: string; repo: string; timestamp: string }[];
  cacheStats: { hitRate: number; missRate: number; size: number };
  anomalyAlerts: { level: string; message: string; timestamp: string }[];
}

// Define Error Response Type
interface ApiErrorResponse {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const period = (searchParams.get('period') as 'week' | 'month') || 'week';
  const activeTab = searchParams.get('tab') || 'overview';

  const setPeriod = (newPeriod: 'week' | 'month') => {
    setSearchParams(
      (params) => {
        params.set('period', newPeriod);
        return params;
      },
      { replace: true }
    );
  };
  const setActiveTab = (newTab: string) => {
    setSearchParams(
      (params) => {
        params.set('tab', newTab);
        return params;
      },
      { replace: true }
    );
  };
  const [isRefetching, setIsRefetching] = useState(false);
  const hasFetched = useRef(false);

  const fetchDashboardData = useCallback(
    async (isRefetch = false) => {
      if (!isRefetch) setIsLoading(true);
      else setIsRefetching(true);

      setError(null);
      try {
        const { data: resData } = await api.get(`/admin/dashboard?period=${period}`);
        setData(resData);
      } catch (err: unknown) {
        const apiError = err as ApiErrorResponse;
        const msg = apiError?.response?.data?.error || apiError?.message || 'Unknown error';
        setError(`API Error (${apiError?.response?.status || 'Network'}): ${msg}`);
      } finally {
        if (!isRefetch) setIsLoading(false);
        else setIsRefetching(false);
      }
    },
    [period]
  );

  useEffect(() => {
    fetchDashboardData(hasFetched.current);
    hasFetched.current = true;
  }, [period, fetchDashboardData]);

  if (isLoading && !data) {
    return (
      <PageWrapper title="Admin Dashboard" description="">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-wharf-pink border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-sm text-wharf-text-tertiary mt-4">Loading Dashboard...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper title="Admin Dashboard" description="">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <h2 className="font-display font-black text-2xl tracking-tighter mb-2">
              Dashboard Error
            </h2>
            <p className="font-mono text-sm text-wharf-error mb-4">
              {error || 'No data returned.'}
            </p>
            <p className="font-mono text-xs text-wharf-text-secondary mb-4 capitalize">
              If you see a 403, log out & log back in to get a fresh admin token...
            </p>
            <button
              onClick={() => fetchDashboardData(false)}
              className="font-mono text-sm font-bold px-4 py-2 bg-wharf-pink/20 border border-wharf-pink/40 text-wharf-pink-darker hover:bg-wharf-pink/30 transition-colors rounded-md cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Admin Dashboard" description="">
      <div className="space-y-12">
        <AdminHeader onRefresh={() => fetchDashboardData(true)} isRefetching={isRefetching} />
        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-12 mb-12">
            <AdminStats stats={data.stats} />
            {/* Usage Trend + Provider */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AdminUsageChart
                data={data.usageData}
                period={period}
                onPeriodChange={setPeriod}
                isRefetching={isRefetching}
              />
              <AdminProviderChart data={data.providerData} />
            </div>
            {/* Feature Usage + Token Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AdminFeatureChart data={data.featureData} />
              <AdminTokenUsage data={data.tokenData} />
            </div>
            {/* Heatmap */}
            <AdminHeatmap data={data.heatmapData} />
            {/* Top Users + Top Repos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AdminTopUsers users={data.topUsers} />
              <AdminPopularRepos repos={data.popularRepos} />
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-12 mb-12">
            <AdminCacheStats stats={data.cacheStats} />
            <AdminCostEstimate cost={data.stats.estimatedCost} />
          </div>
        )}

        {/* Metrics / Live Feed */}
        {activeTab === 'metrics' && (
          <div className=" mb-12">
            <AdminLiveFeed activities={data.recentActivity} />
          </div>
        )}

        {/* Logs / Alerts */}
        {activeTab === 'logs' && (
          <div className="mb-12">
            <AdminAnomalyAlert alerts={data.anomalyAlerts} />
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
