import posthog from 'posthog-js';
import type { AnalyticsProvider, AnalyticsEvent, UserTraits } from '../types';

export class PostHogProvider implements AnalyticsProvider {
  name = 'PostHog';

  initialize() {
    const key = import.meta.env.VITE_POSTHOG_KEY;
    if (key) {
      posthog.init(key, { api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com' });
    }
  }

  track(event: AnalyticsEvent) {
    posthog.capture(event.name, event.properties);
  }

  identify(traits: UserTraits) {
    const { userId, ...properties } = traits;
    posthog.identify(userId, properties);
  }

  page(url: string) {
    posthog.capture('$pageview', { $current_url: url });
  }

  reset() {
    posthog.reset();
  }
}
