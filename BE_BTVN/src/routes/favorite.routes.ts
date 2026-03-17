import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getMyFavorites, toggleFavorite, isFavorite } from "../controllers/favorite.controller";

const router = Router();
router.use(authMiddleware as any);

router.get("/", getMyFavorites as any);
router.post("/toggle", toggleFavorite as any);
router.get("/:productId", isFavorite as any);

export default router;

