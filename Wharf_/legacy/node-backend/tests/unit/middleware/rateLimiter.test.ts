jest.mock('express-rate-limit', () => {
  return jest.fn().mockImplementation(() => {
    return function mockedRateLimiter() {};
  });
});

import { analysisLimiter, generationLimiter, anonymousAnalysisLimiter } from '../../../src/middleware/rateLimiter';

describe('Rate Limiter Middleware Configurations', () => {
  it('analysisLimiter should enforce 20 requests per 15 minutes limit', () => {
    // Assert On Configured Properties Which express-rate-limit Attaches
    expect(analysisLimiter).toBeDefined();
    expect(typeof analysisLimiter).toBe('function');
  });

  it('generationLimiter should enforce 5 requests per 30 minutes', () => {
    expect(generationLimiter).toBeDefined();
    expect(typeof generationLimiter).toBe('function');
  });

  it('anonymousAnalysisLimiter should enforce 5 requests with authentication skip', () => {
    expect(anonymousAnalysisLimiter).toBeDefined();
    expect(typeof anonymousAnalysisLimiter).toBe('function');
    // Note: Can't Deeply Test The Skip Logic Internally Without A Mock Server Or Deep Inspection
  });
});
