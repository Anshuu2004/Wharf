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
        <div className="space-y-12">
          <AdminHeader onRefresh={() => {}} isRefetching={false} />
          <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Skeleton Loader */}
          {activeTab === 'overview' && (
            <div className="space-y-12 mb-12 animate-pulse">
              {/* Admin Stats Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[104px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal-sm rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-wharf-border-secondary rounded w-20"></div>
                      <div className="w-8 h-8 bg-wharf-border-secondary rounded"></div>
                    </div>
                    <div className="h-6 bg-wharf-border-secondary rounded w-16 mt-2"></div>
                  </div>
                ))}
              </div>

              {/* Two Medium Height Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-[400px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                  <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-wharf-border-secondary rounded w-1/3 mb-10"></div>
                  <div className="h-[240px] bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg"></div>
                </div>
                <div className="h-[400px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                  <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-wharf-border-secondary rounded w-1/3 mb-10"></div>
                  <div className="h-[240px] bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg mx-auto w-3/4 rounded-full"></div>
                </div>
              </div>

              {/* Feature Usage + Token Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-[400px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                  <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-wharf-border-secondary rounded w-1/3 mb-10"></div>
                  <div className="h-[240px] bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg"></div>
                </div>
                <div className="h-[400px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                  <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-wharf-border-secondary rounded w-1/3 mb-10"></div>
                  <div className="h-[240px] bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg"></div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="h-[280px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-wharf-border-secondary rounded w-1/3 mb-10"></div>
                <div className="h-[120px] bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-lg"></div>
              </div>

              {/* Top Users + Top Repos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-[450px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                  <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="h-[450px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                  <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-12 mb-12 animate-pulse">
              <div className="h-[200px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6">
                <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="h-24 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"></div>
                  <div className="h-24 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"></div>
                  <div className="h-24 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"></div>
                </div>
              </div>
              <div className="h-[150px] bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6 flex flex-col justify-center">
                <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-wharf-border-secondary rounded w-32"></div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="mb-12 animate-pulse">
              <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6 min-h-[600px]">
                <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="mb-12 animate-pulse">
              <div className="bg-wharf-surface-primary border-2 border-wharf-border-primary shadow-brutal rounded-3xl p-6 min-h-[500px]">
                <div className="h-6 bg-wharf-border-secondary rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-20 bg-wharf-surface-secondary border-2 border-wharf-border-secondary rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
