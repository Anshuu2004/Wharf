import type { AnalyticsProvider, AnalyticsEvent, UserTraits } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export class GA4Provider implements AnalyticsProvider {
  name = 'GoogleAnalytics4';
  private measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;

  initialize() {
    // Base GA4 script + config is handled in index.html
    // No dynamic injection needed
    console.log('[GA4] Provider ready, gtag loaded via index.html');
  }

  track(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.name, event.properties);
    }
  }

  identify(traits: UserTraits) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', traits);
    }
  }

  page(url: string) {
    if (typeof window !== 'undefined' && window.gtag && this.measurementId) {
      window.gtag('config', this.measurementId, { page_path: url });
    }
  }

  reset() {
  }
}
