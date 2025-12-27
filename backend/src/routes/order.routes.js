import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMySales,
} from "../controllers/order.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

//  Customer & Seller Routes
router.route("/").post(protect, addOrderItems);
router.route("/myorders").get(protect, getMyOrders);
router.route("/my-sales").get(protect, getMySales);

//  Admin Routes
router.route("/all").get(protect, admin, getAllOrders);
router.route("/:id/status").put(protect, admin, updateOrderStatus);

//  Common Route
router.route("/:id").get(protect, getOrderById);

export default router;
