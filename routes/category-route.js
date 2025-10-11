import express from "express";
import {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
  getCategoriesCount,
} from "../controllers/category-controller.js";

const router = express.Router();
import  upload  from "../middleware/multer.js";

router.get("/get-category-count", getCategoriesCount);
router.post("/create-category", upload.array("category_img", 10), createCategory);
router.get("/get-all-categories", getAllCategories);
router.get("/get-single-category/:categoryId", getSingleCategory);
router.put("/update-category/:categoryId", upload.array("category_img", 10), updateCategory);
router.delete("/delete-category/:categoryId", deleteCategory);
export default router;
