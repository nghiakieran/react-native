import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware as any);
router.use(authorizeRoles("ADMIN") as any);

router.get("/stats", getDashboardStats as any);

export default router;
