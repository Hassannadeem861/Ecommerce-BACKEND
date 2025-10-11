import express from "express";
import {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus, 
getOrdersCount,
getAllPayments,
// getDeliveredOrders,
//  getMonthlySales
} from "../controllers/order-controller.js";

import { authMiddleware } from "../middleware/user-middle-ware.js";

const router = express.Router();

//  Guest checkout (no login required)
router.post("/guest-checkout", createOrder);  

//  Authenticated checkout (login required)
router.post("/create-order", authMiddleware, createOrder);

router.get("/get-all-orders", getAllOrders);

router.get("/get-single-order/:orderId", getSingleOrder);

router.put("/orders/:id/status", updateOrderStatus);

router.put("/update-order/:orderId", authMiddleware, updateOrder);


router.delete("/delete-order/:orderId", authMiddleware, deleteOrder);

router.get("/orders-count", getOrdersCount);

router.get("/get-all-payments" , getAllPayments);

// router.get("/get-all-devlivered-orders" , getDeliveredOrders)

// router.get("/monthly-sales", getMonthlySales);

export default router;
