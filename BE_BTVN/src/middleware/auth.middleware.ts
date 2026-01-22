import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

// Simplified auth middleware - no JWT verification
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // No authentication required - just pass through
  next();
};
