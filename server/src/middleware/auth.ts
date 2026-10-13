import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, IUserDocument } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: Record<string, any>;
  userDoc?: IUserDocument;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };

    if (!decoded || !decoded.id) {
      res.status(403).json({ success: false, message: 'Invalid session token structure.' });
      return;
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Account not found in database or session expired. Please sign in again.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact campus administration.',
      });
      return;
    }

    req.user = user.toSafeObject();
    req.userDoc = user;
    next();
  } catch (err: any) {
    res.status(403).json({
      success: false,
      message: 'Session has expired or token is invalid. Please sign in again.',
    });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user.toSafeObject();
          req.userDoc = user;
        }
      }
    } catch {
      // Ignored for optional authentication
    }
  }
  next();
};

export const requireRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const userRole = req.user.role;
    // Treat 'student' and 'user' interchangeably for role checks
    const isAllowed = roles.some(
      r =>
        r === userRole ||
        (r === 'student' && userRole === 'user') ||
        (r === 'user' && userRole === 'student')
    );

    if (!isAllowed) {
      res.status(403).json({
        success: false,
        message: `Access denied. This action requires [${roles.join(', ')}] privileges. Current role: ${userRole}.`,
      });
      return;
    }

    next();
  };
};
