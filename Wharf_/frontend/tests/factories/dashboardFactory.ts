export const mockDashboardStats = {
  totalUsers: 1,
  totalGenerations: 100,
  activeUsers: 1,
  heatmap: [],
  usageData: [],
};

export const mockGlobalStats = {
  totalTokens: 1000,
  totalReadmes: 50,
  totalProfiles: 10,
  totalHealthChecks: 10,
  totalChangelogs: 10,
  totalChats: 10,
  totalActiveUsers: 1,
  avgResponseTimeMs: 150,
};

export const createMockDashboardStats = (overrides = {}) => ({
  ...mockDashboardStats,
  ...overrides,
});
