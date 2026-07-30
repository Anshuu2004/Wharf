export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export interface UserTraits {
  userId: string;
  username?: string;
  email?: string;
  [key: string]: any;
}

export interface AnalyticsProvider {
  name: string;
  initialize(): void;
  track(event: AnalyticsEvent): void;
  identify(traits: UserTraits): void;
  page(url: string): void;
  reset(): void;
}
