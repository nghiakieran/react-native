import { Request, Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import { generateOTP, getOTPExpiry, isOTPExpired } from "../utils/otp";
import emailService from "../services/email.service";

// Update Profile (Name & Avatar)
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const { name } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Update name if provided
        if (name) user.name = name;

        // Update avatar if file uploaded
        if (req.file) {
            // Delete old avatar if exists (optional, keeping it simple for now)
            if (user.avatar) {
                // Logic to delete old file could go here
            }
            // Store relative path
            user.avatar = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Change Password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
            return;
        }

        const userId = (req as any).userId;
        const { oldPassword, newPassword } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Incorrect old password" });
            return;
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Request Change Phone (Send OTP)
export const requestChangePhone = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
            return;
        }

        const userId = (req as any).userId;
        const { newPhone } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.otpPurpose = "CHANGE_PHONE";
        await user.save();

        // In a real app, send SMS. Here we mock it by sending email or just returning success for dev.
        // For this assignment, let's send an email saying "Use this code to verify phone change to [newPhone]"
        await emailService.sendRegistrationOTP(user.email, otp, user.name + ` (for Phone Change to ${newPhone})`);

        res.status(200).json({
            success: true,
            message: "OTP sent to your email (simulating SMS) to verify phone change"
        });

    } catch (error) {
        console.error("Request change phone error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Verify Change Phone
export const verifyChangePhone = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
            return;
        }

        const userId = (req as any).userId;
        const { newPhone, otp } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        if (user.otp !== otp || user.otpPurpose !== "CHANGE_PHONE") {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (!user.otpExpiry || isOTPExpired(user.otpExpiry)) {
            res.status(400).json({ success: false, message: "OTP expired" });
            return;
        }

        // Update phone
        user.phone = newPhone;
        user.otp = null;
        user.otpExpiry = null;
        user.otpPurpose = null;
        await user.save();

        res.status(200).json({ success: true, message: "Phone number updated successfully", phone: newPhone });

    } catch (error) {
        console.error("Verify change phone error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// Request Change Email
export const requestChangeEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
            return;
        }

        const userId = (req as any).userId;
        const { newEmail } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // Check if email already used
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser) {
            res.status(400).json({ success: false, message: "Email already in use" });
            return;
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.otpPurpose = "CHANGE_EMAIL";
        await user.save();

        // Send OTP to NEW email (to verify ownership)
        await emailService.sendRegistrationOTP(newEmail, otp, user.name + " (Verify New Email)");

        res.status(200).json({
            success: true,
            message: "OTP sent to your NEW email address"
        });

    } catch (error) {
        console.error("Request change email error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Verify Change Email
export const verifyChangeEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
            return;
        }

        const userId = (req as any).userId;
        const { newEmail, otp } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        if (user.otp !== otp || user.otpPurpose !== "CHANGE_EMAIL") {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (!user.otpExpiry || isOTPExpired(user.otpExpiry)) {
            res.status(400).json({ success: false, message: "OTP expired" });
            return;
        }

        // Update email
        user.email = newEmail;
        // We might want to set isVerified=false if we treat this as a new account reset, 
        // but typically changing email implies verification of the new one here.
        // So we keep isVerified=true as they are already logged in and just verified the new email.
        user.otp = null;
        user.otpExpiry = null;
        user.otpPurpose = null;
        await user.save();

        res.status(200).json({ success: true, message: "Email updated successfully", email: newEmail });

    } catch (error) {
        console.error("Verify change email error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
