import { Router } from "express";
import { body } from "express-validator";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import {
    updateProfile,
    changePassword,
    requestChangePhone,
    verifyChangePhone,
    requestChangeEmail,
    verifyChangeEmail,
} from "../controllers/user.controller";

const router = Router();

// Validation rules
const changePasswordValidation = [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters"),
];

const changePhoneValidation = [
    body("newPhone").notEmpty().withMessage("New phone number is required"),
];

const verifyPhoneValidation = [
    body("newPhone").notEmpty().withMessage("New phone number is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

const changeEmailValidation = [
    body("newEmail").isEmail().withMessage("Valid new email is required"),
];

const verifyEmailValidation = [
    body("newEmail").isEmail().withMessage("Valid new email is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
];

// Apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes
router.put("/profile", upload.single("avatar"), updateProfile);
router.put("/change-password", changePasswordValidation, changePassword);

// Change Phone routes
router.post("/change-phone/request", changePhoneValidation, requestChangePhone);
router.post("/change-phone/verify", verifyPhoneValidation, verifyChangePhone);

// Change Email routes
router.post("/change-email/request", changeEmailValidation, requestChangeEmail);
router.post("/change-email/verify", verifyEmailValidation, verifyChangeEmail);

export default router;
