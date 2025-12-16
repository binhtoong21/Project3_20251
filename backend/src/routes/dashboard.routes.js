import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getDashboardStats);

export default router;
