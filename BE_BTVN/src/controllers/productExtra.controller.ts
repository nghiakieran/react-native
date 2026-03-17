import { Request, Response } from "express";
import { Op } from "sequelize";
import Product from "../models/product.model";
import Review from "../models/review.model";

const parseId = (v: any): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

// GET /api/products/:id/stats
export const getProductStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseId(req.params.id);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const reviewCount = await Review.count({ where: { productId } });

    res.json({
      success: true,
      data: {
        buyersCount: Number(product.soldCount || 0), // proxy: soldCount
        reviewersCount: reviewCount,
      },
    });
  } catch (error) {
    console.error("getProductStats error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/products/:id/similar?limit=10
export const getSimilarProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = parseId(req.params.id);
    if (!productId) {
      res.status(400).json({ success: false, message: "productId không hợp lệ" });
      return;
    }

    const limit = Math.max(1, Math.min(30, parseInt((req.query.limit as string) || "10", 10)));
    const base = await Product.findByPk(productId);
    if (!base) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    const products = await Product.findAll({
      where: {
        id: { [Op.ne]: base.id },
        category: base.category,
      },
      order: [["soldCount", "DESC"], ["discount", "DESC"], ["createdAt", "DESC"]],
      limit,
    });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("getSimilarProducts error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

