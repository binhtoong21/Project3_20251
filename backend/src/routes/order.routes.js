import express from "express";
import { addOrderItems } from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").post(protect, addOrderItems);

export default router;
