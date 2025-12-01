import { Router } from "express";
import * as cartCtrl from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", protect, cartCtrl.list);
router.post("/add", protect, cartCtrl.add);
router.put("/:id", protect, cartCtrl.updateQuantity);
router.delete("/:id", protect, cartCtrl.remove);

export default router;