import { http, HttpResponse } from 'msw';
import { mockUser } from '../factories';
import { mockDashboardStats, mockGlobalStats } from '../factories/dashboardFactory';

export const handlers = [
  http.get('/api/auth/me', () => {
    return HttpResponse.json({ success: true, data: mockUser });
  }),

  http.get('/api/user/repos', () => {
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get('/api/user/profile', () => {
    return HttpResponse.json({ success: true, data: mockUser });
  }),

  http.get('/api/user/notifications', () => {
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get('/api/admin/dashboard', () => {
    return HttpResponse.json({ success: true, data: mockDashboardStats });
  }),

  http.get('/api/admin/public-stats', () => {
    return HttpResponse.json({ success: true, data: mockGlobalStats });
  }),

  http.post('/api/generate/readme', () => {
    return HttpResponse.json({ success: true, message: 'Generation started' });
  }),

  http.get('/api/generate/history', () => {
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.post('/api/changelog/stats', () => {
    return HttpResponse.json({ success: true, data: { commits: 10, lines: 100 } });
  }),

  http.get('/api/changelog/history', () => {
    return HttpResponse.json({ success: true, data: [] });
  }),

  http.get('/api/profile/history', () => {
    return HttpResponse.json({ success: true, data: [] });
  }),
];
