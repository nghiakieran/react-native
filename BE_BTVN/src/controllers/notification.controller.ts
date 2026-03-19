import { Response } from "express";
import { Op, fn, col } from "sequelize";
import Notification, { NotificationType } from "../models/notification.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(100, limit)) : 20;
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: safeLimit,
      offset,
    });

    const unreadRows = await Notification.findAll({
      where: { userId, readAt: { [Op.is]: null } },
      attributes: [
        "type",
        [fn("COUNT", col("id")), "count"],
      ],
      group: ["type"],
      raw: true,
    });

    const unreadCounts: Record<NotificationType, number> = {
      ORDER_NEW: 0,
      REVIEW_NEW: 0,
      REVIEW_COMMENT_NEW: 0,
      PRODUCT_NEW: 0,
      COUPON_NEW: 0,
    };

    for (const r of unreadRows as any[]) {
      const type = r.type as NotificationType;
      const countNum = Number(r.count || 0);
      if (type && typeof unreadCounts[type] === "number") unreadCounts[type] = countNum;
    }

    res.json({
      success: true,
      data: {
        items: rows.map((n) => ({
          id: n.id,
          eventId: n.eventId,
          type: n.type,
          title: n.title,
          message: n.message,
          createdAt: n.createdAt.toISOString(),
          meta: n.meta ? safeJsonParse(n.meta) : undefined,
          read: n.readAt == null,
        })),
        unreadCounts,
        pagination: {
          total: count,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(count / safeLimit),
        },
      },
    });
  } catch (error) {
    console.error("getMyNotifications error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy thông báo" });
  }
};

const safeJsonParse = (v: string): any => {
  try {
    return JSON.parse(v);
  } catch (_e) {
    return undefined;
  }
};

export const markAllRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    await Notification.update(
      { readAt: new Date() },
      { where: { userId, readAt: { [Op.is]: null } } },
    );

    const unread = await Notification.findAll({
      where: { userId, readAt: { [Op.is]: null } },
    });

    // If there are no rows left, counts are all 0.
    const unreadCounts: Record<NotificationType, number> = {
      ORDER_NEW: 0,
      REVIEW_NEW: 0,
      REVIEW_COMMENT_NEW: 0,
      PRODUCT_NEW: 0,
      COUPON_NEW: 0,
    };

    for (const n of unread) {
      unreadCounts[n.type] += 1;
    }

    res.json({ success: true, data: { unreadCounts } });
  } catch (error) {
    console.error("markAllRead error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi đánh dấu đã đọc" });
  }
};

export const markReadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ success: false, message: "notification id không hợp lệ" });
      return;
    }

    await Notification.update(
      { readAt: new Date() },
      { where: { userId, id, readAt: { [Op.is]: null } } },
    );

    res.json({ success: true });
  } catch (error) {
    console.error("markReadById error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi đánh dấu đã đọc" });
  }
};
