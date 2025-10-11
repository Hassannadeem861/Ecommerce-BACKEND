import express from "express";
import {
  createCart,
  getAllCarts,
  getSingleCart,
  updateCart,
  deleteCart,
} from "../controllers/cart-controller.js";
import { authMiddleware } from "../middleware/user-middle-ware.js";

const router = express.Router();

router.post("/create-cart", createCart);
router.get("/get-all-carts", getAllCarts);
router.get("/get-single-cart/:cartId", getSingleCart);
router.put("/update-cart/:cartId", updateCart);
router.delete("/delete-cart/:cartId", deleteCart);

export default router;
