import { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../../../src/middleware/requestId.middleware';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('RequestId Middleware', () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockSetHeader: jest.Mock;

  beforeEach(() => {
    mockSetHeader = jest.fn();
    mockReq = { headers: {} };
    mockRes = { setHeader: mockSetHeader };
    mockNext = jest.fn();
    (uuidv4 as jest.Mock).mockReturnValue('generated-uuid-v4');
  });

  it('should use existing header if provided', () => {
    mockReq.headers['x-request-id'] = 'existing-id-123';
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.id).toBe('existing-id-123');
    expect(mockSetHeader).toHaveBeenCalledWith('X-Request-Id', 'existing-id-123');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should extract first element if header is array', () => {
    mockReq.headers['x-request-id'] = ['header1', 'header2'];
    
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockReq.id).toBe('header1');
    expect(mockSetHeader).toHaveBeenCalledWith('X-Request-Id', 'header1');
  });

  it('should fallback to generated uuid if not provided', () => {
    requestIdMiddleware(mockReq as Request, mockRes as Response, mockNext);
    
    expect(uuidv4).toHaveBeenCalled();
    expect(mockReq.id).toBe('generated-uuid-v4');
    expect(mockSetHeader).toHaveBeenCalledWith('X-Request-Id', 'generated-uuid-v4');
  });
});
