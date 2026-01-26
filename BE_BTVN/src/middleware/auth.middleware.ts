import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: number;
}

// JWT authentication middleware
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach userId to request
    (req as any).userId = decoded.userId;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

// Optional auth middleware for reset password (uses resetToken)
export const resetPasswordMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const { resetToken } = req.body;

    if (!resetToken) {
      res.status(401).json({
        success: false,
        message: "Reset token is required",
      });
      return;
    }

    // Verify reset token
    const decoded = verifyToken(resetToken);

    // Attach userId to request
    (req as any).userId = decoded.userId;

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
};
