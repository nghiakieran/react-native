import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";

export const generateToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const generateResetToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const verifyToken = (token: string): IJwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as IJwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
