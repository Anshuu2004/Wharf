import { useEffect } from 'react';
import { analytics } from '../lib/analytics/AnalyticsService';
import { useLocation } from 'react-router-dom';

export function useAnalytics() {
  return analytics;
}

export function usePageViewTracking() {
  const location = useLocation();

  useEffect(() => {
    analytics.page(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
