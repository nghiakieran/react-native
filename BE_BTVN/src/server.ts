import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import "./models/index";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import reviewRoutes from "./routes/review.routes";
import favoriteRoutes from "./routes/favorite.routes";
import recentViewRoutes from "./routes/recentView.routes";
import couponRoutes from "./routes/coupon.routes";
import loyaltyRoutes from "./routes/loyalty.routes";
import { errorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import emailService from "./services/email.service";
import path from "path";
import { seedAdmin } from "./seeders/user.seeder";
import { checkAndAutoConfirmOrders } from "./controllers/order.controller";


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
      cart: "GET|POST|PUT|DELETE /api/cart (protected)",
      orders: "GET|POST /api/orders (protected)",
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
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recent-views", recentViewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Run seeders
    await seedAdmin();

    // Tự động kiểm tra và xác nhận đơn hàng quá hạn khi khởi động
    await checkAndAutoConfirmOrders();
    
    // Thiết lập chu kỳ kiểm tra tự động mỗi 5 phút
    setInterval(checkAndAutoConfirmOrders, 5 * 60 * 1000);

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
