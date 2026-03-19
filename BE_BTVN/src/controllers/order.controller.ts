import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import Order, { OrderItem, OrderStatus, PaymentMethod } from "../models/order.model";
import CartItem from "../models/cart.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import Coupon from "../models/coupon.model";
import OrderDiscount from "../models/orderDiscount.model";
import LoyaltyWallet from "../models/loyaltyWallet.model";
import PointTransaction from "../models/pointTransaction.model";
import { Op } from "sequelize";
import { emitActivityToRole, emitActivityToUser } from "../socket";

// ─── Hằng số ───────────────────────────────────────────────────────────────────
const CANCEL_WINDOW_MS = 30 * 60 * 1000;      // 30 phút để hủy đơn
const AUTO_CONFIRM_DELAY_MS = 30 * 60 * 1000; // 30 phút tự động xác nhận

// ─── Task: Kiểm tra và tự động xác nhận tất cả đơn hàng quá hạn (Dùng khi Restart Server) ───
export const checkAndAutoConfirmOrders = async (): Promise<void> => {
    try {
        const threshold = new Date(Date.now() - AUTO_CONFIRM_DELAY_MS);
        
        // Tìm và cập nhật tất cả đơn hàng NEW đã quá 30 phút
        const [updatedCount] = await Order.update(
            { 
                status: OrderStatus.CONFIRMED,
                confirmedAt: new Date()
            },
            {
                where: {
                    status: OrderStatus.NEW,
                    createdAt: {
                        [Op.lt]: threshold
                    }
                }
            }
        );

        if (updatedCount > 0) {
            console.log(`[Auto-confirm] Hệ thống đã tự động xác nhận ${updatedCount} đơn hàng quá hạn (30p).`);
        }
    } catch (err) {
        console.error("[Auto-confirm] Lỗi khi quét đơn hàng tự động:", err);
    }
};

// ─── Helper: Tự động xác nhận đơn hàng sau 30 phút (Dùng cho đơn mới tạo) ────────
const scheduleAutoConfirm = (orderId: number): void => {
    setTimeout(async () => {
        try {
            const order = await Order.findByPk(orderId);
            // Chỉ xác nhận nếu vẫn còn ở trạng thái NEW
            if (order && order.status === OrderStatus.NEW) {
                await order.update({
                    status: OrderStatus.CONFIRMED,
                    confirmedAt: new Date(),
                });
                console.log(`[Auto-confirm] Đơn hàng #${orderId} đã được xác nhận tự động.`);
            }
        } catch (err) {
            console.error(`[Auto-confirm] Lỗi khi xác nhận đơn hàng #${orderId}:`, err);
        }
    }, AUTO_CONFIRM_DELAY_MS);
};

// ─── POST /api/orders ──────────────────────────────────────────────────────────
// Tạo đơn hàng mới từ giỏ hàng (hoặc danh sách sản phẩm chỉ định)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { shippingAddress, note, cartItemIds, couponCode, usePoints } = req.body;

        if (!shippingAddress || shippingAddress.trim() === "") {
            res.status(400).json({ success: false, message: "Địa chỉ giao hàng là bắt buộc" });
            return;
        }

        // Lấy items từ giỏ hàng (toàn bộ hoặc theo cartItemIds)
        const whereClause: any = { userId };
        if (cartItemIds && cartItemIds.length > 0) {
            whereClause.id = cartItemIds;
        }

        const cartItems = await CartItem.findAll({
            where: whereClause,
            include: [{ model: Product, as: "product" }],
        });

        if (cartItems.length === 0) {
            res.status(400).json({ success: false, message: "Giỏ hàng trống" });
            return;
        }

        // Kiểm tra tồn kho & tính tổng tiền
        let subtotalAmount = 0;
        const orderItemsData: any[] = [];

        for (const ci of cartItems) {
            const product = (ci as any).product as Product;
            if (!product) {
                res.status(400).json({ success: false, message: `Sản phẩm ID ${ci.productId} không tồn tại` });
                return;
            }
            if (product.stock < ci.quantity) {
                res.status(400).json({
                    success: false,
                    message: `"${product.name}" chỉ còn ${product.stock} trong kho, bạn đang đặt ${ci.quantity}`,
                });
                return;
            }

            const discountedPrice = product.price * (1 - product.discount / 100);
            subtotalAmount += discountedPrice * ci.quantity;

            orderItemsData.push({
                productId: product.id,
                productName: product.name,
                productImage: product.imageUrl,
                price: product.price,
                quantity: ci.quantity,
                discount: product.discount,
            });
        }

        const subtotalRounded = Math.round(subtotalAmount);

        // ─── Apply coupon (optional) ───────────────────────────────────────────
        let appliedCouponCode: string | null = null;
        let couponDiscount = 0;

        if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
            const code = couponCode.trim().toUpperCase();
            const coupon = await Coupon.findOne({ where: { code } });
            const now = new Date();
            const isInWindow =
                coupon &&
                (!coupon.startAt || new Date(coupon.startAt) <= now) &&
                (!coupon.endAt || new Date(coupon.endAt) >= now);

            if (!coupon || !coupon.isActive || !isInWindow) {
                res.status(400).json({ success: false, message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
                return;
            }
            if (subtotalRounded < Number(coupon.minOrderAmount || 0)) {
                res.status(400).json({
                    success: false,
                    message: `Đơn tối thiểu ${Number(coupon.minOrderAmount).toLocaleString("vi-VN")}đ`,
                });
                return;
            }
            if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
                res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng" });
                return;
            }

            if (coupon.type === "PERCENT") {
                couponDiscount = Math.round((subtotalRounded * Number(coupon.value)) / 100);
            } else {
                couponDiscount = Math.round(Number(coupon.value));
            }
            if (coupon.maxDiscount != null) {
                couponDiscount = Math.min(couponDiscount, Math.round(Number(coupon.maxDiscount)));
            }
            couponDiscount = Math.max(0, Math.min(couponDiscount, subtotalRounded));
            appliedCouponCode = coupon.code;

            await coupon.update({ usedCount: coupon.usedCount + 1 });
        }

        // ─── Apply loyalty points (optional) ───────────────────────────────────
        let pointsUsed = 0;
        const afterCoupon = Math.max(0, subtotalRounded - couponDiscount);

        if (usePoints) {
            const [wallet] = await LoyaltyWallet.findOrCreate({
                where: { userId },
                defaults: { userId, points: 0 },
            });
            const canUse = Math.max(0, Math.min(wallet.points, afterCoupon));
            pointsUsed = canUse;
            if (pointsUsed > 0) {
                await wallet.update({ points: wallet.points - pointsUsed });
            }
        }

        const finalTotal = Math.max(0, afterCoupon - pointsUsed);

        // Tạo đơn hàng
        const order = await Order.create({
            userId,
            totalAmount: finalTotal,
            status: OrderStatus.NEW,
            paymentMethod: PaymentMethod.COD,
            shippingAddress: shippingAddress.trim(),
            note: note?.trim() || undefined,
        });

        // Tạo order items
        await Promise.all(
            orderItemsData.map((item) =>
                OrderItem.create({ ...item, orderId: order.id })
            )
        );

        // Giảm stock của sản phẩm & tăng soldCount
        await Promise.all(
            cartItems.map(async (ci) => {
                const product = (ci as any).product as Product;
                await product.update({
                    stock: product.stock - ci.quantity,
                    soldCount: product.soldCount + ci.quantity,
                });
            })
        );

        // Xóa các cart items đã đặt hàng
        await CartItem.destroy({ where: whereClause });

        // Save pricing breakdown
        await OrderDiscount.create({
            orderId: order.id,
            couponCode: appliedCouponCode,
            subtotal: subtotalRounded,
            couponDiscount,
            pointsUsed,
            finalTotal,
        });

        if (pointsUsed > 0) {
            await PointTransaction.create({
                userId,
                type: "SPEND",
                points: pointsUsed,
                note: "Dùng điểm tích lũy khi đặt hàng",
                orderId: order.id,
            });
        }

        // ⏰ Lên lịch tự động xác nhận sau 30 phút
        scheduleAutoConfirm(order.id);

        // Socket: notify new order
        const createdAtIso = order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString();
        emitActivityToUser(userId, {
            eventId: `ORDER_NEW:${order.id}`,
            type: "ORDER_NEW",
            title: "Đơn hàng mới",
            message: `Bạn vừa có đơn hàng #${order.id}.`,
            createdAt: createdAtIso,
            meta: { orderId: order.id },
        });

        emitActivityToRole("ADMIN", {
            eventId: `ORDER_NEW:${order.id}`,
            type: "ORDER_NEW",
            title: "Thông báo quản trị",
            message: `Có đơn hàng mới #${order.id}.`,
            createdAt: createdAtIso,
            meta: { orderId: order.id },
        });

        // Lấy đơn hàng đầy đủ để trả về
        const fullOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: "items" }, { model: OrderDiscount, as: "pricing" }],
        });

        res.status(201).json({
            success: true,
            message: "Đặt hàng thành công! Đơn hàng sẽ được xác nhận trong 30 phút.",
            data: fullOrder,
        });
    } catch (error) {
        console.error("createOrder error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi tạo đơn hàng" });
    }
};

// ─── GET /api/orders ───────────────────────────────────────────────────────────
// Lấy danh sách tất cả đơn hàng của user (có phân trang)
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const whereClause: any = { userId };
        if (status) whereClause.status = status;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            include: [{ model: OrderItem, as: "items" }, { model: OrderDiscount, as: "pricing" }],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        res.json({
            success: true,
            data: orders,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("getMyOrders error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách đơn hàng" });
    }
};

// ─── GET /api/orders/:id ───────────────────────────────────────────────────────
// Lấy chi tiết một đơn hàng cụ thể
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        // Cho phép Admin xem mọi đơn hàng, User chỉ xem đơn của mình
        const user = await User.findByPk(userId);
        const whereClause: any = { id };
        if (user?.role !== 'ADMIN') {
            whereClause.userId = userId;
        }

        const order = await Order.findOne({
            where: whereClause,
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [
                        {
                            model: Product,
                            as: "product",
                            attributes: ["id", "name", "imageUrl", "price", "discount"],
                        },
                    ],
                },
                { model: OrderDiscount, as: "pricing" },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "email", "phone"],
                },
            ],
        });

        if (!order) {
            res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
            return;
        }

        // Tính thời gian còn lại để hủy đơn
        const createdAt = new Date(order.createdAt!).getTime();
        const elapsed = Date.now() - createdAt;
        const canCancelDirectly = order.status === OrderStatus.NEW && elapsed < CANCEL_WINDOW_MS;
        const canRequestCancel = order.status === OrderStatus.PREPARING;
        const remainingCancelMs = canCancelDirectly ? CANCEL_WINDOW_MS - elapsed : 0;

        res.json({
            success: true,
            data: order,
            cancelInfo: {
                canCancelDirectly,
                canRequestCancel,
                remainingCancelMs,
                remainingCancelMinutes: Math.ceil(remainingCancelMs / 60000),
            },
        });
    } catch (error) {
        console.error("getOrderById error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy đơn hàng" });
    }
};

// ─── PUT /api/orders/:id/cancel ───────────────────────────────────────────────
// Hủy đơn hàng (logic theo yêu cầu):
//  - Đơn NEW trong 30 phút → Hủy trực tiếp
//  - Đơn PREPARING → Gửi yêu cầu hủy (CANCEL_REQUESTED)
//  - Các trạng thái khác → Không cho hủy
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const { reason } = req.body;

        // Admin có thể hủy mọi đơn hàng, User chỉ hủy đơn của mình
        const user = await User.findByPk(userId);
        const whereClause: any = { id };
        if (user?.role !== 'ADMIN') {
            whereClause.userId = userId;
        }

        const order = await Order.findOne({ where: whereClause });
        if (!order) {
            res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
            return;
        }

        const isAdmin = user?.role === 'ADMIN';

        // Logic cho Admin: Hủy được mọi lúc, mọi trạng thái (trừ đã giao/đã hủy)
        if (isAdmin) {
            if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
                res.status(400).json({
                    success: false,
                    message: `Không thể hủy đơn hàng đã ở trạng thái ${order.status}`,
                });
                return;
            }

            // Hoàn lại stock cho Admin
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            await Promise.all(
                orderItems.map(async (item) => {
                    const product = await Product.findByPk(item.productId);
                    if (product) {
                        await product.update({
                            stock: product.stock + item.quantity,
                            soldCount: Math.max(0, product.soldCount - item.quantity),
                        });
                    }
                })
            );

            await order.update({
                status: OrderStatus.CANCELLED,
                cancelReason: reason && reason !== "Người dùng hủy" ? reason : "Admin hủy đơn",
            });

            res.json({
                success: true,
                message: "Đơn hàng đã được Admin hủy thành công",
                data: order,
            });
            return;
        }

        // Logic cho User (giữ nguyên)
        const createdAt = new Date(order.createdAt!).getTime();
        const elapsed = Date.now() - createdAt;

        // Case 1: Đơn mới, trong vòng 30 phút → hủy trực tiếp
        if (order.status === OrderStatus.NEW && elapsed < CANCEL_WINDOW_MS) {
            // Hoàn lại stock
            const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
            await Promise.all(
                orderItems.map(async (item) => {
                    const product = await Product.findByPk(item.productId);
                    if (product) {
                        await product.update({
                            stock: product.stock + item.quantity,
                            soldCount: Math.max(0, product.soldCount - item.quantity),
                        });
                    }
                })
            );

            await order.update({
                status: OrderStatus.CANCELLED,
                cancelReason: reason || "Người dùng hủy đơn",
            });

            res.json({
                success: true,
                message: "Đơn hàng đã được hủy thành công",
                data: order,
            });
            return;
        }

        // Case 2: Đơn mới nhưng đã quá 30 phút
        if (order.status === OrderStatus.NEW && elapsed >= CANCEL_WINDOW_MS) {
            res.status(400).json({
                success: false,
                message: "Đã quá 30 phút kể từ khi đặt hàng, không thể hủy trực tiếp. Vui lòng liên hệ shop.",
            });
            return;
        }

        // Case 3: Đơn đã CONFIRMED → không hủy được (User)
        if (order.status === OrderStatus.CONFIRMED) {
            res.status(400).json({
                success: false,
                message: "Đơn hàng đã được xác nhận. Vui lòng liên hệ shop để được hỗ trợ.",
            });
            return;
        }

        // Case 4: Đơn đang PREPARING → gửi yêu cầu hủy (User)
        if (order.status === OrderStatus.PREPARING) {
            await order.update({
                status: OrderStatus.CANCEL_REQUESTED,
                cancelReason: reason || "Người dùng yêu cầu hủy đơn",
            });

            res.json({
                success: true,
                message: "Yêu cầu hủy đơn đã được gửi đến shop. Shop sẽ xử lý sớm nhất có thể.",
                data: order,
            });
            return;
        }

        // Case 5: Các trạng thái khác
        res.status(400).json({
            success: false,
            message: `Không thể hủy đơn hàng ở trạng thái "${order.status}"`,
        });
    } catch (error) {
        console.error("cancelOrder error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi hủy đơn hàng" });
    }
};

// ─── PUT /api/orders/:id/status   (ADMIN ONLY) ────────────────────────────────
// Admin cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        const validStatuses = Object.values(OrderStatus);
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: `Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(", ")}`,
            });
            return;
        }

        const order = await Order.findByPk(parseInt(id as string, 10));
        if (!order) {
            res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
            return;
        }

        // Hoàn kho nếu Admin chuyển sang trạng thái CANCELLED
        if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
            const items = await OrderItem.findAll({ where: { orderId: order.id } });
            await Promise.all(
                items.map(async (item) => {
                    const product = await Product.findByPk(item.productId);
                    if (product) {
                        await product.update({
                            stock: product.stock + item.quantity,
                            soldCount: Math.max(0, product.soldCount - item.quantity),
                        });
                    }
                })
            );
        }

        const updateData: any = { status };
        if (status === OrderStatus.CONFIRMED && !order.confirmedAt) {
            updateData.confirmedAt = new Date();
        }
        if (status === OrderStatus.CANCELLED) {
            updateData.cancelReason = note || "Admin hủy đơn";
        }
        if (note) updateData.note = note;

        await order.update(updateData);

        res.json({
            success: true,
            message: `Đã cập nhật trạng thái đơn hàng thành "${status}"`,
            data: order,
        });
    } catch (error) {
        console.error("updateOrderStatus error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật trạng thái đơn hàng" });
    }
};

// ─── GET /api/orders/admin/all   (ADMIN ONLY) ─────────────────────────────────
// Admin xem toàn bộ đơn hàng
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const whereClause: any = {};
        if (status) whereClause.status = status;

        const { count, rows: orders } = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: "items" },
                { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        res.json({
            success: true,
            data: orders,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error("getAllOrders error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách đơn hàng" });
    }
};
