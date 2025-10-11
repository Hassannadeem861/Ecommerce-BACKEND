import express from "express";
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsCount,
  searchProducts,
} from "../controllers/product-controller.js";

const router = express.Router();
import  upload  from "../middleware/multer.js";

router.post("/create-product", upload.array("productImg", 10), createProduct);
router.get("/get-all-products", getAllProducts);
router.get("/get-single-product/:productId", getSingleProduct);
router.put("/update-product/:productId", upload.array("productImg", 5), updateProduct);
router.delete("/delete-product/:productId", deleteProduct);
router.get("/get-product-count", getProductsCount);
router.get("/search", searchProducts);

export default router;