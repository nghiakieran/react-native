import { Router } from "express";
import { getProducts, getProductById, getTopSellingProducts, getDiscountedProducts } from "../controllers/product.controller";

const router = Router();

router.get("/", getProducts);
router.get("/top-selling", getTopSellingProducts);
router.get("/discounted", getDiscountedProducts);
router.get("/:id", getProductById);

export default router;
