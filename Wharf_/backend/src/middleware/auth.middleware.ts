import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Proceed Without User (Optional Auth)
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.error('[Auth Middleware] Invalid token error:', error.message);
    // If Token Is Invalid, We Still Proceed But Without A User
    next();
  }
};

// Middleware To Require Authentication For Specific Routes.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};
