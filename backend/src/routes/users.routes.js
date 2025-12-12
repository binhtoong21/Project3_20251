import { Router } from "express";
import * as usersCtrl from "../controllers/users.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", usersCtrl.register);
router.post("/login", usersCtrl.login);
router
  .route("/profile")
  .get(protect, usersCtrl.getProfile)
  .put(protect, usersCtrl.updateProfile);
router.put("/profile/address", protect, usersCtrl.updateAddress);

router.get("/", protect, admin, usersCtrl.getUsers);

export default router;