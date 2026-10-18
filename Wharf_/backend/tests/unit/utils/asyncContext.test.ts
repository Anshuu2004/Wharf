import { requestContext, getContext, getContextData } from '../../../src/utils/asyncContext';
import { describe, expect, test } from 'vitest';

describe('asyncContext Utility', () => {
  test('should return undefined context when not running in the AsyncLocalStorage scope', () => {
    expect(getContext()).toBeUndefined();
    
    // getContextData Returns Object With Undefined Fields
    expect(getContextData()).toEqual({
      requestId: undefined,
      userId: undefined,
      username: undefined
    });
  });

  test('should return exactly the context provided when running inside requestContext.run', async () => {
    const mockContext = {
      requestId: 'req-123',
      userId: 'user-456',
      username: 'johndoe'
    };

    await new Promise<void>((resolve) => {
      requestContext.run(mockContext, () => {
        const ctx = getContext();
        expect(ctx).toEqual(mockContext);

        const ctxData = getContextData();
        expect(ctxData).toEqual(mockContext);
        
        resolve();
      });
    });
  });
});
