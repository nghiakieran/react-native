import { Request, Response } from "express";
import { Op } from "sequelize";
import Product from "../models/product.model";

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, category, minPrice, maxPrice, limit = 20, page = 1 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const offset = (pageNum - 1) * limitNum;

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

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit: limitNum,
            offset: offset,
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                limit: limitNum,
            },
            data: rows,
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

export const getDiscountedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 20 } = req.query;

        const products = await Product.findAll({
            where: {
                discount: { [Op.gt]: 0 } // Only products with discount > 0
            },
            order: [['discount', 'DESC']], // Highest discount first
            limit: Number(limit),
        });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error("Get Discounted Products Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, category, imageUrl, stock, discount = 0 } = req.body;
        const product = await Product.create({
            name,
            description,
            price,
            category,
            imageUrl,
            stock,
            discount,
            soldCount: 0
        });
        res.status(201).json({ success: true, message: "Product created", data: product });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await Product.findByPk(Number(id));
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        await product.update(updates);
        res.json({ success: true, message: "Product updated", data: product });
    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(Number(id));
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        await product.destroy();
        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
