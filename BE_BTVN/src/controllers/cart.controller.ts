import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import CartItem from "../models/cart.model";
import Product from "../models/product.model";

// ─── GET /api/cart ─────────────────────────────────────────────────────────────
// Lấy toàn bộ giỏ hàng của user hiện tại (kèm thông tin sản phẩm)
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ["id", "name", "price", "discount", "imageUrl", "stock"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Tính tổng tiền
        const subtotal = cartItems.reduce((sum, item) => {
            const product = (item as any).product;
            if (!product) return sum;
            const discountedPrice = product.price * (1 - product.discount / 100);
            return sum + discountedPrice * item.quantity;
        }, 0);

        res.json({
            success: true,
            data: cartItems,
            subtotal: Math.round(subtotal),
            totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        });
    } catch (error) {
        console.error("getCart error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi lấy giỏ hàng" });
    }
};

// ─── POST /api/cart ────────────────────────────────────────────────────────────
// Thêm sản phẩm vào giỏ hàng (nếu đã có thì cộng dồn số lượng)
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            res.status(400).json({ success: false, message: "productId là bắt buộc" });
            return;
        }

        if (quantity < 1) {
            res.status(400).json({ success: false, message: "Số lượng phải ít nhất là 1" });
            return;
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findByPk(productId);
        if (!product) {
            res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
            return;
        }

        // Kiểm tra tồn kho
        if (product.stock < quantity) {
            res.status(400).json({
                success: false,
                message: `Sản phẩm chỉ còn ${product.stock} trong kho`,
            });
            return;
        }

        // Tìm hoặc tạo cart item (nếu đã có thì cộng dồn)
        const [cartItem, created] = await CartItem.findOrCreate({
            where: { userId, productId },
            defaults: { userId, productId, quantity },
        });

        if (!created) {
            // Đã có → cộng dồn số lượng
            const newQuantity = cartItem.quantity + quantity;
            if (newQuantity > product.stock) {
                res.status(400).json({
                    success: false,
                    message: `Không thể thêm. Giỏ hàng đã có ${cartItem.quantity}, kho chỉ còn ${product.stock}`,
                });
                return;
            }
            await cartItem.update({ quantity: newQuantity });
        }

        // Lấy lại với thông tin sản phẩm
        const updatedItem = await CartItem.findByPk(cartItem.id, {
            include: [{ model: Product, as: "product" }],
        });

        res.status(created ? 201 : 200).json({
            success: true,
            message: created ? "Đã thêm vào giỏ hàng" : "Đã cập nhật số lượng trong giỏ hàng",
            data: updatedItem,
        });
    } catch (error) {
        console.error("addToCart error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi thêm vào giỏ hàng" });
    }
};

// ─── PUT /api/cart/:id ────────────────────────────────────────────────────────
// Cập nhật số lượng của một item trong giỏ hàng
export const updateCartItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            res.status(400).json({ success: false, message: "Số lượng phải ít nhất là 1" });
            return;
        }

        const cartItem = await CartItem.findOne({ where: { id, userId } });
        if (!cartItem) {
            res.status(404).json({ success: false, message: "Không tìm thấy item trong giỏ hàng" });
            return;
        }

        // Kiểm tra tồn kho
        const product = await Product.findByPk(cartItem.productId);
        if (!product || product.stock < quantity) {
            res.status(400).json({
                success: false,
                message: `Sản phẩm chỉ còn ${product?.stock ?? 0} trong kho`,
            });
            return;
        }

        await cartItem.update({ quantity });

        const updatedItem = await CartItem.findByPk(cartItem.id, {
            include: [{ model: Product, as: "product" }],
        });

        res.json({ success: true, message: "Đã cập nhật giỏ hàng", data: updatedItem });
    } catch (error) {
        console.error("updateCartItem error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi cập nhật giỏ hàng" });
    }
};

// ─── DELETE /api/cart/:id ─────────────────────────────────────────────────────
// Xóa một item khỏi giỏ hàng
export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const { id } = req.params;

        const cartItem = await CartItem.findOne({ where: { id, userId } });
        if (!cartItem) {
            res.status(404).json({ success: false, message: "Không tìm thấy item trong giỏ hàng" });
            return;
        }

        await cartItem.destroy();
        res.json({ success: true, message: "Đã xóa khỏi giỏ hàng" });
    } catch (error) {
        console.error("removeFromCart error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa khỏi giỏ hàng" });
    }
};

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
// Xóa toàn bộ giỏ hàng của user
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;

        const deleted = await CartItem.destroy({ where: { userId } });
        res.json({
            success: true,
            message: `Đã xóa toàn bộ giỏ hàng (${deleted} item)`,
        });
    } catch (error) {
        console.error("clearCart error:", error);
        res.status(500).json({ success: false, message: "Lỗi server khi xóa giỏ hàng" });
    }
};
