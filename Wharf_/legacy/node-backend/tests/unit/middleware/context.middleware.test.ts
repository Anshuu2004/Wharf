import { Request, Response, NextFunction } from 'express';
import { contextMiddleware } from '../../../src/middleware/context.middleware';
import { requestContext } from '../../../src/utils/asyncContext';

jest.mock('../../../src/utils/asyncContext', () => ({
  requestContext: { run: jest.fn((store, cb) => cb()) }
}));

describe('Context Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should initialize async context with reqId from req.id', () => {
    mockReq.id = 'xyz-123';
    contextMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.contextStore).toEqual({ requestId: 'xyz-123' });
    expect(requestContext.run).toHaveBeenCalledWith({ requestId: 'xyz-123' }, expect.any(Function));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should default to system if no req.id exists', () => {
    contextMiddleware(mockReq as Request, mockRes as Response, mockNext);
    expect(mockReq.contextStore).toEqual({ requestId: 'system' });
  });
});
