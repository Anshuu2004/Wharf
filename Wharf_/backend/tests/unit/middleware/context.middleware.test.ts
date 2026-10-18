import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { contextMiddleware } from '../../../src/middleware/context.middleware';
import { requestContext } from '../../../src/utils/asyncContext';
import { createMockContext } from '../test-utils';

vi.mock('../../../src/utils/asyncContext', () => ({
  requestContext: { run: vi.fn((store, cb) => cb()) }
}));

describe('Context Middleware', () => {
  let mockNext: Mock;

  beforeEach(() => {
    mockNext = vi.fn();
  });

  it('should initialize async context with reqId from req.id', async () => {
    const c = createMockContext();
    c.get = vi.fn((key: string) => key === 'requestId' ? 'xyz-123' : undefined);
    
    await contextMiddleware(c, mockNext);
    
    expect(c.set).toHaveBeenCalledWith('contextStore', { requestId: 'xyz-123' });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should default to system if no req.id exists', async () => {
    const c = createMockContext();
    c.get = vi.fn(() => undefined);
    await contextMiddleware(c, mockNext);
    expect(c.set).toHaveBeenCalledWith('contextStore', { requestId: 'system' });
  });
});
