import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} from "../controllers/user-controller.js";
import { authMiddleware } from "../middleware/user-middle-ware.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/get-all-users", getAllUsers);
router.get("/get-single-user/:userId", getSingleUser);
router.put("/update-user/:userId", updateUser);
router.delete("/delete-user/:userId", deleteUser);

export default router;
