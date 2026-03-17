import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getMyWallet } from "../controllers/loyalty.controller";

const router = Router();
router.use(authMiddleware as any);

router.get("/wallet", getMyWallet as any);

export default router;

