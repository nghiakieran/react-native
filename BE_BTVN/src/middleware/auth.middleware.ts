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

    // ... existing authMiddleware ending here ...
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

// Authorization middleware
import User from "../models/user.model";

export const authorizeRoles = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.status(401).json({ success: false, message: "User not authenticated" });
        return;
      }

      const user = await User.findByPk(req.userId);

      if (!user || !roles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: `Role (${user?.role}) is not allowed to access this resource`,
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error during authorization" });
    }
  };
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
