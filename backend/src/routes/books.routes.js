import { Router } from "express";
import * as booksCtrl from "../controllers/books.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", booksCtrl.list);
router.get("/:id", booksCtrl.getById);

//  các route cho Admin
router.post("/", protect, admin, booksCtrl.create);
router.put("/:id", protect, admin, booksCtrl.update);
router.delete("/:id", protect, admin, booksCtrl.remove);

export default router;
