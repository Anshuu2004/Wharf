import type { AnalyticsProvider, AnalyticsEvent, UserTraits } from './types';

class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private isDevelopment = import.meta.env.MODE === 'development';

  public register(provider: AnalyticsProvider) {
    this.providers.push(provider);
    try {
      provider.initialize();
    } catch (error) {
      console.error(`[Analytics] Failed to initialize provider: ${provider.name}`, error);
    }
  }

  public track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = { name, properties };
    
    if (this.isDevelopment) {
      console.log(`[Analytics:Track]`, name, properties);
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.track(event);
      } catch (error) {
        console.error(`[Analytics] Track failed in ${provider.name}`, error);
      }
    });
  }

  public identify(traits: UserTraits) {
    if (this.isDevelopment) {
      console.log(`[Analytics:Identify]`, traits);
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.identify(traits);
      } catch (error) {
        console.error(`[Analytics] Identify failed in ${provider.name}`, error);
      }
    });
  }

  public page(url?: string) {
    const pageUrl = url || window.location.pathname;
    if (this.isDevelopment) {
      console.log(`[Analytics:Page]`, pageUrl);
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.page(pageUrl);
      } catch (error) {
        console.error(`[Analytics] Page tracking failed in ${provider.name}`, error);
      }
    });
  }

  public reset() {
    if (this.isDevelopment) {
      console.log(`[Analytics:Reset] User session reset`);
      return;
    }

    this.providers.forEach(provider => {
      try {
        provider.reset();
      } catch (error) {
        console.error(`[Analytics] Reset failed in ${provider.name}`, error);
      }
    });
  }
}

export const analytics = new AnalyticsService();
