import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import Favorite from "../models/favorite.model";
import Product from "../models/product.model";

const parseId = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, data: favorites });
  } catch (error) {
    console.error("getMyFavorites error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách yêu thích" });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const productId = parseId(req.body.productId);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }

    const existing = await Favorite.findOne({ where: { userId, productId } });
    if (existing) {
      await existing.destroy();
      res.json({ success: true, data: { isFavorite: false } });
      return;
    }

    await Favorite.create({ userId, productId });
    res.status(201).json({ success: true, data: { isFavorite: true } });
  } catch (error) {
    console.error("toggleFavorite error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi cập nhật yêu thích" });
  }
};

export const isFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const productId = parseId(req.params.productId);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }
    const existing = await Favorite.findOne({ where: { userId, productId } });
    res.json({ success: true, data: { isFavorite: !!existing } });
  } catch (error) {
    console.error("isFavorite error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

