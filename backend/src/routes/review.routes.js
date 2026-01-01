import express from "express";
import {
  getBookReviews,
  createReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/:bookId").get(getBookReviews);
router.route("/").post(protect, createReview);
router.route("/:id").delete(protect, deleteReview);

export default router;
