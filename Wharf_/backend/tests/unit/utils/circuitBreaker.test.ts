import { CircuitBreaker } from '../../../src/utils/circuitBreaker';
import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';

describe('CircuitBreaker Utility', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    // Threshold 2, Cooldown 10000ms
    breaker = new CircuitBreaker(2, 10000);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should execute successful actions normally', async () => {
    const action = vi.fn<any>().mockResolvedValue('success');
    const result = await breaker.fire(action as any);

    expect(result).toBe('success');
    expect(action).toHaveBeenCalledTimes(1);
  });

  test('should not increment failure count on 400 errors', async () => {
    const action = vi.fn<any>().mockRejectedValue({ status: 404, message: 'Not Found' });

    await expect(breaker.fire(action as any)).rejects.toEqual({ status: 404, message: 'Not Found' });
    
    // Should Still Be Able To Fire Again Because Thresholds Are Not Triggered
    const successAction = vi.fn<any>().mockResolvedValue('success');
    await expect(breaker.fire(successAction as any)).resolves.toBe('success');
  });

  test('should open circuit after threshold is reached due to 500 errors', async () => {
    const failAction = vi.fn<any>().mockRejectedValue({ status: 503 });

    // Fail 1
    await expect(breaker.fire(failAction as any)).rejects.toEqual({ status: 503 });
    // Fail 2 - Meets Threshold
    await expect(breaker.fire(failAction as any)).rejects.toEqual({ status: 503 });

    // Next Action Should Fast-Fail Without Calling The Action
    const anyAction = vi.fn();
    await expect(breaker.fire(anyAction as any)).rejects.toThrow('503: Service Unavailable - Circuit Breaker is OPEN');
    
    expect(anyAction).not.toHaveBeenCalled();
  });

  test('should transition to half-open and reset on success after cooling period', async () => {
    const failAction = vi.fn<any>().mockRejectedValue({ code: 'ETIMEDOUT' });

    // Fail To Open Circuit
    await expect(breaker.fire(failAction as any)).rejects.toBeTruthy();
    await expect(breaker.fire(failAction as any)).rejects.toBeTruthy();

    // Fast-Fail
    await expect(breaker.fire(vi.fn() as any)).rejects.toThrow('OPEN');

    // Advance Timers Beyond TimeoutMs
    vi.advanceTimersByTime(15000);

    // Should Allow 1 Request Through (Half-Open)
    const successAction = vi.fn<any>().mockResolvedValue('recovered');
    await expect(breaker.fire(successAction as any)).resolves.toBe('recovered');

    // Should Be Fully Closed Now, Allowing More Requests
    await expect(breaker.fire(successAction as any)).resolves.toBe('recovered');
  });
});
