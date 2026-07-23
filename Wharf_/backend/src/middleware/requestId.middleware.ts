import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.id = Array.isArray(reqId) ? reqId[0] : reqId;
  res.setHeader('X-Request-Id', req.id);
  next();
};
