import type { Mock } from "vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { requestIdMiddleware } from '../../../src/middleware/requestId.middleware';
import { v4 as uuidv4 } from 'uuid';
import { createMockContext } from '../test-utils';

vi.mock('uuid', () => ({
  v4: vi.fn()
}));

describe('RequestId Middleware', () => {
  let mockNext: Mock;

  beforeEach(() => {
    mockNext = vi.fn();
    (uuidv4 as Mock).mockReturnValue('generated-uuid-v4');
  });

  it('should use existing header if provided', async () => {
    const c = createMockContext({ headers: { 'x-request-id': 'existing-id-123' } });
    await requestIdMiddleware(c, mockNext);
    
    expect(c.set).toHaveBeenCalledWith('requestId', 'existing-id-123');
    expect(c.header).toHaveBeenCalledWith('X-Request-Id', 'existing-id-123');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should fallback to generated uuid if not provided', async () => {
    const c = createMockContext({ headers: {} });
    await requestIdMiddleware(c, mockNext);
    
    expect(uuidv4).toHaveBeenCalled();
    expect(c.set).toHaveBeenCalledWith('requestId', 'generated-uuid-v4');
    expect(c.header).toHaveBeenCalledWith('X-Request-Id', 'generated-uuid-v4');
  });
});
