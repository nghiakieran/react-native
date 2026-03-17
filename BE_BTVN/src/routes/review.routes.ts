import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { createReview, getProductReviews, getReviewEligibility } from "../controllers/review.controller";

const router = Router();

// Public: list reviews of a product
router.get("/product/:productId", getProductReviews as any);

// Protected: eligibility + create
router.get("/eligibility/:productId", authMiddleware as any, getReviewEligibility as any);
router.post("/", authMiddleware as any, createReview as any);

export default router;

