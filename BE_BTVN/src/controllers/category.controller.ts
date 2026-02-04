import { Request, Response } from "express";
import Category from "../models/category.model";

/**
 * Get all active categories ordered by the 'order' field
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { includeInactive } = req.query;

        const whereClause: any = {};

        // By default, only return active categories
        if (includeInactive !== 'true') {
            whereClause.isActive = true;
        }

        const categories = await Category.findAll({
            where: whereClause,
            order: [
                ['order', 'ASC'],
                ['name', 'ASC']
            ],
        });

        res.json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(Number(id));

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        res.json({ success: true, data: category });
    } catch (error) {
        console.error("Get Category By ID Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Create a new category (Admin only - add auth middleware as needed)
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, order, isActive } = req.body;

        if (!name) {
            res.status(400).json({ success: false, message: "Category name is required" });
            return;
        }

        const category = await Category.create({
            name,
            description,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error: any) {
        console.error("Create Category Error:", error);

        // Handle unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ success: false, message: "Category name already exists" });
            return;
        }

        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Update a category (Admin only - add auth middleware as needed)
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, order, isActive } = req.body;

        const category = await Category.findByPk(Number(id));

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        await category.update({
            name: name || category.name,
            description: description !== undefined ? description : category.description,
            order: order !== undefined ? order : category.order,
            isActive: isActive !== undefined ? isActive : category.isActive,
        });

        res.json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error: any) {
        console.error("Update Category Error:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ success: false, message: "Category name already exists" });
            return;
        }

        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Delete a category (Admin only - add auth middleware as needed)
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(Number(id));

        if (!category) {
            res.status(404).json({ success: false, message: "Category not found" });
            return;
        }

        await category.destroy();

        res.json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        console.error("Delete Category Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
