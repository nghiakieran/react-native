import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { IAuthResponse } from "../types";
import { generateToken } from "../utils/jwt";
import {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
  isValidOTPFormat,
} from "../utils/otp";
import emailService from "../services/email.service";

// Register new user with OTP
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Create new user (not verified yet)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
      otpPurpose: "REGISTER",
    });

    // Send OTP email
    await emailService.sendRegistrationOTP(email, otp, name);

    const response: IAuthResponse = {
      success: true,
      message: "Registration successful. Please check your email for OTP code.",
      email: user.email,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// Verify OTP (for registration or password reset)
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, otp, purpose } = req.body;

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP format. OTP must be 6 digits.",
      });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if OTP matches and purpose is correct
    if (user.otp !== otp || user.otpPurpose !== purpose) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP code",
      });
      return;
    }

    // Check if OTP has expired
    if (!user.otpExpiry || isOTPExpired(user.otpExpiry)) {
      res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
      return;
    }

    // OTP is valid
    if (purpose === "REGISTER") {
      // Activate account
      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      user.otpPurpose = null;
      await user.save();

      // Generate JWT token
      const token = generateToken(user.id);

      const response: IAuthResponse = {
        success: true,
        message: "Account verified successfully",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      };

      res.status(200).json(response);
    } else if (purpose === "RESET_PASSWORD") {
      // Generate temporary reset token
      const resetToken = generateToken(user.id, "15m");

      // Clear OTP (will be cleared again after password reset)
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      const response: IAuthResponse = {
        success: true,
        message: "OTP verified. You can now reset your password.",
        resetToken,
      };

      res.status(200).json(response);
    }
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, purpose } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if user is already verified (for registration purpose)
    if (purpose === "REGISTER" && user.isVerified) {
      res.status(400).json({
        success: false,
        message: "Account is already verified. Please login.",
      });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpPurpose = purpose;
    await user.save();

    // Send OTP email
    if (purpose === "REGISTER") {
      await emailService.sendRegistrationOTP(email, otp, user.name);
    } else {
      await emailService.sendPasswordResetOTP(email, otp, user.name);
    }

    const response: IAuthResponse = {
      success: true,
      message: "New OTP code has been sent to your email",
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending OTP",
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check if account is verified
    if (!user.isVerified) {
      res.status(401).json({
        success: false,
        message:
          "Please verify your account first. Check your email for OTP code.",
        code: "ACCOUNT_NOT_VERIFIED",
        email: user.email,
      });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id);

    const response: IAuthResponse = {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Forget password - send OTP
export const forgetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });

    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, an OTP code has been sent.",
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpPurpose = "RESET_PASSWORD";
    await user.save();

    // Send OTP email
    await emailService.sendPasswordResetOTP(email, otp, user.name);

    const response: IAuthResponse = {
      success: true,
      message: "OTP code has been sent to your email for password reset",
      email: user.email,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Forget password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset request",
    });
  }
};

// Reset password with token
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
      return;
    }

    const { newPassword } = req.body;

    // Verify reset token (this will be set by auth middleware)
    const userId = (req as any).userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired reset token",
      });
      return;
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear OTP fields
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.otpPurpose = null;
    await user.save();

    const response: IAuthResponse = {
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

// Get current user (protected route)
export const getCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "otp", "otpExpiry", "otpPurpose"] },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const response: IAuthResponse = {
      success: true,
      message: "User data retrieved successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
