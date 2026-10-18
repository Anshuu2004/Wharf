import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../utils/asyncContext';

export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const store = {
    requestId: (req as any).id || 'system',
  };

  (req as any).contextStore = store;

  requestContext.run(store, () => {
    next();
  });
};
