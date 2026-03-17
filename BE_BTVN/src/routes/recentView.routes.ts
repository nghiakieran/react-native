import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getMyRecentViews, upsertRecentView } from "../controllers/recentView.controller";

const router = Router();
router.use(authMiddleware as any);

router.get("/", getMyRecentViews as any);
router.post("/", upsertRecentView as any);

export default router;

