import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    getAllOrders,
} from "../controllers/order.controller";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware as any);

// ── User routes ────────────────────────────────────────────────────────────────
// POST   /api/orders            - Tạo đơn hàng mới từ giỏ hàng
router.post("/", createOrder as any);

// GET    /api/orders            - Lấy danh sách đơn hàng của tôi (?page=1&limit=10&status=NEW)
router.get("/", getMyOrders as any);

// GET    /api/orders/admin/all  - Admin xem tất cả đơn hàng (đặt TRƯỚC /:id để không bị conflict)
router.get("/admin/all", authorizeRoles("ADMIN") as any, getAllOrders as any);

// GET    /api/orders/:id        - Chi tiết một đơn hàng
router.get("/:id", getOrderById as any);

// PUT    /api/orders/:id/cancel - Hủy / gửi yêu cầu hủy đơn hàng
router.put("/:id/cancel", cancelOrder as any);

// PUT    /api/orders/:id/status - Admin cập nhật trạng thái đơn hàng
router.put("/:id/status", authorizeRoles("ADMIN") as any, updateOrderStatus as any);

export default router;
