import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMySales,
  confirmReceipt,
  disputeOrder,
  resolveDispute,
  requestRefund,
  confirmRefundRequest,
  rejectRefundRequest,
  forceComplete,
  cancelOrder
} from "../controllers/order.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

//  Customer & Seller Routes
router.route("/").post(protect, addOrderItems);
router.route("/myorders").get(protect, getMyOrders);
router.route("/my-sales").get(protect, getMySales);

//  Admin Routes
 router.route("/all").get(protect, admin, getAllOrders);
router.route("/:id/status").put(protect, updateOrderStatus); // Permissions handled in controller
router.route("/:id/resolve-dispute").put(protect, admin, resolveDispute);

// Buyer/Seller Action Routes
router.route("/:id/confirm-receipt").put(protect, confirmReceipt);
router.route("/:id/dispute").put(protect, disputeOrder);
router.route("/:id/refund-request").put(protect, requestRefund);
router.route("/:id/refund-confirm").put(protect, confirmRefundRequest);
router.route("/:id/refund-reject").put(protect, rejectRefundRequest);

// Force complete (Admin)
router.route('/:id/force-complete').put(protect, admin, forceComplete);

// Cancel Order (Buyer - Pending COD)
router.route("/:id/cancel").put(protect, cancelOrder);

//  Common Route
router.route("/:id").get(protect, getOrderById);

export default router;
