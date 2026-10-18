export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private threshold: number,
    private timeoutMs: number
  ) {}

  async fire<T>(action: () => Promise<T>): Promise<T> {
    if (this.failureCount >= this.threshold) {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        // Half-Open State: Allow 1 Request Through To Test If The Service Is Back
        this.failureCount = this.threshold - 1;
      } else {
        throw new Error(
          '503: Service Unavailable - Circuit Breaker is OPEN. Fast failing to protect system resources.'
        );
      }
    }

    try {
      const result = await action();
      this.failureCount = 0; // Reset On Success
      return result;
    } catch (e: any) {
      // Only Count Network Timeouts Or 5xx Server Errors Against The Break Threshold
      if (
        e.status >= 500 ||
        e.code === 'ETIMEDOUT' ||
        e.message?.includes('timeout') ||
        e.message?.includes('socket hang up')
      ) {
        this.failureCount++;
        this.lastFailureTime = Date.now();
      }
      throw e;
    }
  }
}

// Global Instance To Protect Against GitHub API Outages
export const githubCircuitBreaker = new CircuitBreaker(5, 30000); // 5 Failures -> 30s Cooldown
