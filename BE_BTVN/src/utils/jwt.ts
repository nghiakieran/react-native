import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export const generateToken = (userId: number, expiresIn?: string): string => {
  return jwt.sign({ userId }, JWT_SECRET as jwt.Secret, {
    expiresIn: (expiresIn || JWT_EXPIRE) as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): { userId: number } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
