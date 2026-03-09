import { Request, Response } from "express";
import { User, Product, Category, Order } from "../models";

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
            User.count(),
            Product.count(),
            Category.count(),
            Order.count(),
        ]);

        console.log(`[Dashboard Stats] Users: ${userCount}, Products: ${productCount}, Categories: ${categoryCount}, Orders: ${orderCount}`);

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                products: productCount,
                categories: categoryCount,
                orders: orderCount,
            }
        });
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
