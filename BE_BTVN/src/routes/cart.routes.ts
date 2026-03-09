import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../controllers/cart.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

// GET    /api/cart        - Lấy giỏ hàng
router.get("/", getCart as any);

// POST   /api/cart        - Thêm sản phẩm vào giỏ
router.post("/", addToCart as any);

// PUT    /api/cart/:id    - Cập nhật số lượng
router.put("/:id", updateCartItem as any);

// DELETE /api/cart/:id    - Xóa một item
router.delete("/:id", removeFromCart as any);

// DELETE /api/cart        - Xóa toàn bộ giỏ hàng
router.delete("/", clearCart as any);

export default router;
