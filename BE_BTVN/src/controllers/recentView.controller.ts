import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import RecentView from "../models/recentView.model";
import Product from "../models/product.model";

const parseId = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const upsertRecentView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const productId = parseId(req.body.productId);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }

    const existing = await RecentView.findOne({ where: { userId, productId } });
    if (existing) {
      await existing.update({ lastViewedAt: new Date() });
      res.json({ success: true, data: existing });
      return;
    }

    const created = await RecentView.create({ userId, productId, lastViewedAt: new Date() });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("upsertRecentView error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lưu sản phẩm đã xem" });
  }
};

export const getMyRecentViews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const rows = await RecentView.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      order: [["lastViewedAt", "DESC"]],
      limit: Math.max(1, Math.min(100, limit)),
    });
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("getMyRecentViews error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy sản phẩm đã xem" });
  }
};

