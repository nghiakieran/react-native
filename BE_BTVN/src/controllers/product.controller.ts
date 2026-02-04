import { Request, Response } from "express";
import { Op } from "sequelize";
import Product from "../models/product.model";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, category, minPrice, maxPrice, limit = 20, offset = 0 } = req.query;

        const whereClause: any = {};

        // Search by name or description
        if (q) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${q}%` } },
                { description: { [Op.like]: `%${q}%` } },
            ];
        }

        // Filter by category
        if (category) {
            whereClause.category = category;
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = Number(minPrice);
            if (maxPrice) whereClause.price[Op.lte] = Number(maxPrice);
        }

        const products = await Product.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            count: products.count,
            data: products.rows,
        });
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(Number(id));

        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }

        res.json({ success: true, data: product });
    } catch (error) {
        console.error("Get Product By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getTopSellingProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 10 } = req.query;

        const products = await Product.findAll({
            order: [['soldCount', 'DESC']],
            limit: Number(limit),
        });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Get Top Selling Products Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
