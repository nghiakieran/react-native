import { Router } from "express";
import { getProducts, getProductById, getTopSellingProducts, getDiscountedProducts, createProduct, updateProduct, deleteProduct } from "../controllers/product.controller";
import { getProductStats, getSimilarProducts } from "../controllers/productExtra.controller";
import { authMiddleware, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/top-selling", getTopSellingProducts);
router.get("/discounted", getDiscountedProducts);
router.get("/:id/stats", getProductStats);
router.get("/:id/similar", getSimilarProducts);
router.get("/:id", getProductById);

router.post("/", authMiddleware as any, authorizeRoles("ADMIN") as any, createProduct as any);
router.put("/:id", authMiddleware as any, authorizeRoles("ADMIN") as any, updateProduct as any);
router.delete("/:id", authMiddleware as any, authorizeRoles("ADMIN") as any, deleteProduct as any);

export default router;
