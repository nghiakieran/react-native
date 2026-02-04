import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import emailService from "./services/email.service";
import path from "path";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use(requestLogger);

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to BE_BTVN API - OTP Authentication System",
    version: "2.0.0",
    endpoints: {
      register: "POST /api/auth/register",
      verifyOTP: "POST /api/auth/verify-otp",
      resendOTP: "POST /api/auth/resend-otp",
      login: "POST /api/auth/login",
      forgetPassword: "POST /api/auth/forget-password",
      resetPassword: "POST /api/auth/reset-password",
      getCurrentUser: "GET /api/auth/me (protected)",
      categories: "GET /api/categories",
      products: "GET /api/products",
    },
    features: [
      "OTP Email Verification",
      "JWT Authentication",
      "Password Hashing (bcrypt)",
      "Secure Password Reset",
      "Category Management",
    ],
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Verify email service
    await emailService.verifyConnection();

    // Get local IP address for display
    const os = require("os");
    const networkInterfaces = os.networkInterfaces();
    let localIP = "localhost";

    for (const interfaceName in networkInterfaces) {
      const addresses = networkInterfaces[interfaceName];
      if (addresses) {
        for (const addr of addresses) {
          if (addr.family === "IPv4" && !addr.internal) {
            localIP = addr.address;
            break;
          }
        }
      }
      if (localIP !== "localhost") break;
    }

    // Start listening on all network interfaces
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Network: http://${localIP}:${PORT}`);
      console.log(`Android Emulator: http://10.0.2.2:${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
