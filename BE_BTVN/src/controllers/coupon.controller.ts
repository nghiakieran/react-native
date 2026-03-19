import { Request, Response } from "express";
import Coupon from "../models/coupon.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { emitActivityToAllAuth } from "../socket";

const nowWithin = (c: Coupon): boolean => {
  const now = new Date();
  const startOk = !c.startAt || new Date(c.startAt) <= now;
  const endOk = !c.endAt || new Date(c.endAt) >= now;
  return startOk && endOk;
};

export const listActiveCoupons = async (_req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.findAll({
      where: { isActive: true },
      order: [["createdAt", "DESC"]],
      limit: 100,
    });
    res.json({ success: true, data: coupons.filter(nowWithin) });
  } catch (error) {
    console.error("listActiveCoupons error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const adminListCoupons = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.findAll({ order: [["createdAt", "DESC"]], limit: 500 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    console.error("adminListCoupons error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.query.code || "").trim().toUpperCase();
    const subtotal = Number(req.query.subtotal || 0);
    if (!code) {
      res.status(400).json({ success: false, message: "Thiếu mã coupon" });
      return;
    }
    const coupon = await Coupon.findOne({ where: { code } });
    if (!coupon || !coupon.isActive || !nowWithin(coupon)) {
      res.status(404).json({ success: false, message: "Mã không hợp lệ hoặc đã hết hạn" });
      return;
    }
    if (subtotal < Number(coupon.minOrderAmount || 0)) {
      res.status(400).json({
        success: false,
        message: `Đơn tối thiểu ${Number(coupon.minOrderAmount).toLocaleString("vi-VN")}đ`,
      });
      return;
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: "Mã đã hết lượt sử dụng" });
      return;
    }

    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = (subtotal * Number(coupon.value)) / 100;
    } else {
      discount = Number(coupon.value);
    }
    if (coupon.maxDiscount != null) discount = Math.min(discount, Number(coupon.maxDiscount));
    discount = Math.max(0, Math.min(discount, subtotal));

    res.json({ success: true, data: { coupon, discount: Math.round(discount) } });
  } catch (error) {
    console.error("validateCoupon error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin create coupon
export const createCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount = 0,
      maxDiscount = null,
      startAt = null,
      endAt = null,
      usageLimit = null,
      isActive = true,
    } = req.body;

    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) {
      res.status(400).json({ success: false, message: "Thiếu code" });
      return;
    }
    if (type !== "PERCENT" && type !== "FIXED") {
      res.status(400).json({ success: false, message: "type không hợp lệ" });
      return;
    }
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) {
      res.status(400).json({ success: false, message: "value không hợp lệ" });
      return;
    }

    const existing = await Coupon.findOne({ where: { code: normalized } });
    if (existing) {
      res.status(409).json({ success: false, message: "Code đã tồn tại" });
      return;
    }

    const coupon = await Coupon.create({
      code: normalized,
      type,
      value: v,
      minOrderAmount,
      maxDiscount,
      startAt,
      endAt,
      usageLimit,
      isActive,
      usedCount: 0,
    });

    // Socket: notify new coupon (event)
    const createdAtIso = coupon.createdAt ? new Date(coupon.createdAt).toISOString() : new Date().toISOString();
    emitActivityToAllAuth({
      eventId: `COUPON_NEW:${coupon.id}`,
      type: "COUPON_NEW",
      title: "Sự kiện mới",
      message: `Có mã giảm giá mới: ${coupon.code}.`,
      createdAt: createdAtIso,
      meta: { couponId: coupon.id, code: coupon.code },
    });

    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.error("createCoupon error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCoupon = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: "Không tìm thấy coupon" });
      return;
    }
    const updates = req.body || {};
    if (updates.code) updates.code = String(updates.code).trim().toUpperCase();
    await coupon.update(updates);
    res.json({ success: true, data: coupon });
  } catch (error) {
    console.error("updateCoupon error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

