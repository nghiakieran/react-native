import { Router } from "express";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware";
import { adminListCoupons, createCoupon, listActiveCoupons, updateCoupon, validateCoupon } from "../controllers/coupon.controller";

const router = Router();

// Public
router.get("/", listActiveCoupons as any);
router.get("/validate", validateCoupon as any);

// Admin
router.get("/admin/all", authMiddleware as any, authorizeRoles("ADMIN") as any, adminListCoupons as any);
router.post("/", authMiddleware as any, authorizeRoles("ADMIN") as any, createCoupon as any);
router.put("/:id", authMiddleware as any, authorizeRoles("ADMIN") as any, updateCoupon as any);

export default router;

