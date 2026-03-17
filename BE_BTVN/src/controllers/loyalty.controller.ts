import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import LoyaltyWallet from "../models/loyaltyWallet.model";
import PointTransaction from "../models/pointTransaction.model";

export const getMyWallet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const [wallet] = await LoyaltyWallet.findOrCreate({
      where: { userId },
      defaults: { userId, points: 0 },
    });

    const tx = await PointTransaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    res.json({ success: true, data: { points: wallet.points, transactions: tx } });
  } catch (error) {
    console.error("getMyWallet error:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy ví điểm" });
  }
};

