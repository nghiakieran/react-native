import { Router } from "express";
import {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post("/", authMiddleware as any, authorizeRoles("ADMIN") as any, createCategory as any);
router.put("/:id", authMiddleware as any, authorizeRoles("ADMIN") as any, updateCategory as any);
router.delete("/:id", authMiddleware as any, authorizeRoles("ADMIN") as any, deleteCategory as any);

export default router;
