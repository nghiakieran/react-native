import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getMyNotifications, markAllRead, markReadById } from "../controllers/notification.controller";

const router = Router();

router.use(authMiddleware as any);

router.get("/", getMyNotifications as any);
router.put("/read-all", markAllRead as any);
router.put("/:id/read", markReadById as any);

export default router;
