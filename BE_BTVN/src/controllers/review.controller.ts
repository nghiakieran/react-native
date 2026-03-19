import { Response } from "express";
import { Op } from "sequelize";
import { AuthRequest } from "../middleware/auth.middleware";
import Review from "../models/review.model";
import Order, { OrderItem, OrderStatus } from "../models/order.model";
import LoyaltyWallet from "../models/loyaltyWallet.model";
import User from "../models/user.model";
import { emitActivityToUser } from "../socket";

const REVIEW_REWARD_POINTS = 50;

const parseId = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = parseId(req.params.productId);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }

    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const offset = (Math.max(page, 1) - 1) * Math.max(limit, 1);

    const { count, rows } = await Review.findAndCountAll({
      where: { productId },
      include: [{ model: User, as: "user", attributes: ["id", "name", "avatar"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const statsRows = (await Review.findAll({
      where: { productId },
      attributes: ["rating"],
    })) as any[];

    const reviewCount = count;
    const avgRating =
      reviewCount === 0
        ? 0
        : Math.round((statsRows.reduce((s, r) => s + Number(r.rating || 0), 0) / reviewCount) * 10) / 10;

    res.json({
      success: true,
      data: rows,
      stats: { reviewCount, avgRating },
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("getProductReviews error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy đánh giá" });
  }
};

export const getReviewEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const productId = parseId(req.params.productId);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }

    // Must have a DELIVERED order containing this product.
    const deliveredOrders = await Order.findAll({
      where: { userId, status: OrderStatus.DELIVERED },
      include: [{ model: OrderItem, as: "items", where: { productId }, required: true }],
      order: [["createdAt", "DESC"]],
    });

    if (deliveredOrders.length === 0) {
      res.json({ success: true, data: { canReview: false, reason: "Bạn chưa mua thành công sản phẩm này" } });
      return;
    }

    const orderIds = deliveredOrders.map((o) => o.id);

    const existing = await Review.findOne({
      where: { userId, productId, orderId: { [Op.in]: orderIds } },
      order: [["createdAt", "DESC"]],
    });

    if (existing) {
      res.json({ success: true, data: { canReview: false, reason: "Bạn đã đánh giá sản phẩm này rồi", reviewed: true } });
      return;
    }

    res.json({
      success: true,
      data: {
        canReview: true,
        orderId: orderIds[0],
      },
    });
  } catch (error) {
    console.error("getReviewEligibility error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi kiểm tra điều kiện đánh giá" });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const productId = parseId(req.body.productId);
    const orderId = parseId(req.body.orderId);
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";

    if (!productId || !orderId) {
      res.status(400).json({ success: false, message: "Thiếu productId hoặc orderId" });
      return;
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "rating phải từ 1 đến 5" });
      return;
    }

    // Verify order belongs to user & DELIVERED
    const order = await Order.findOne({
      where: { id: orderId, userId, status: OrderStatus.DELIVERED },
      include: [{ model: OrderItem, as: "items", where: { productId }, required: true }],
    });

    if (!order) {
      res.status(403).json({ success: false, message: "Chỉ được đánh giá sản phẩm đã mua thành công" });
      return;
    }

    const existing = await Review.findOne({ where: { userId, productId, orderId } });
    if (existing) {
      res.status(409).json({ success: false, message: "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi" });
      return;
    }

    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment: comment.length ? comment : null,
    });

    // Reward: add points to loyalty wallet
    const [wallet] = await LoyaltyWallet.findOrCreate({
      where: { userId },
      defaults: { userId, points: 0 },
    });
    await wallet.update({ points: wallet.points + REVIEW_REWARD_POINTS });

    // Socket: notify review + optional comment
    const createdAtIso = review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString();

    emitActivityToUser(userId, {
      eventId: `REVIEW_NEW:${review.id}`,
      type: "REVIEW_NEW",
      title: "Đánh giá mới",
      message: `Bạn vừa đánh giá sản phẩm (★ ${review.rating}).`,
      createdAt: createdAtIso,
      meta: { reviewId: review.id, productId: review.productId },
    });

    if (review.comment) {
      emitActivityToUser(userId, {
        eventId: `REVIEW_COMMENT_NEW:${review.id}`,
        type: "REVIEW_COMMENT_NEW",
        title: "Bình luận mới",
        message: `Bạn vừa đăng bình luận: "${review.comment}".`,
        createdAt: createdAtIso,
        meta: { reviewId: review.id, productId: review.productId },
      });
    }

    res.status(201).json({
      success: true,
      message: "Đánh giá thành công",
      data: review,
      reward: { type: "POINTS", pointsAdded: REVIEW_REWARD_POINTS, pointsBalance: wallet.points },
    });
  } catch (error) {
    console.error("createReview error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi tạo đánh giá" });
  }
};

