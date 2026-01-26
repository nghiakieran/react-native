import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgetPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controller";
import {
  authMiddleware,
  resetPasswordMiddleware,
} from "../middleware/auth.middleware";

const router = Router();

// Validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const verifyOTPValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("purpose")
    .isIn(["REGISTER", "RESET_PASSWORD"])
    .withMessage("Invalid purpose"),
];

const resendOTPValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("purpose")
    .isIn(["REGISTER", "RESET_PASSWORD"])
    .withMessage("Invalid purpose"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgetPasswordValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("resetToken").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/verify-otp", verifyOTPValidation, verifyOTP);
router.post("/resend-otp", resendOTPValidation, resendOTP);
router.post("/login", loginValidation, login);
router.post("/forget-password", forgetPasswordValidation, forgetPassword);
router.post(
  "/reset-password",
  resetPasswordValidation,
  resetPasswordMiddleware,
  resetPassword,
);

// Protected routes
router.get("/me", authMiddleware, getCurrentUser);

export default router;
