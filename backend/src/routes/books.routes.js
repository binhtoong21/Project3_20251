import { Router } from "express";
import * as booksCtrl from "../controllers/books.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

// --- Public Routes ---
router.get("/", booksCtrl.list);

// --- User's C2C Routes (must be before /:id) ---
router.get("/my-books", protect, booksCtrl.getMyBooks);
router.post("/user", protect, upload.array("cover", 5), booksCtrl.createUserBook);

// --- Public detail route ---
router.get("/:id", booksCtrl.getById);

// --- User's C2C edit/delete routes ---
router
  .route("/user/:id")
  .put(protect, upload.array("cover", 5), booksCtrl.updateUserBook)
  .delete(protect, booksCtrl.deleteUserBook);

// --- Admin-Only Routes ---
router.post("/", protect, admin, booksCtrl.create);
router.put("/:id", protect, admin, booksCtrl.update);
router.delete("/:id", protect, admin, booksCtrl.remove);

export default router;
