import { Router } from "express";
import * as usersCtrl from "../controllers/users.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", usersCtrl.register);
router.post("/login", usersCtrl.login);
router.get("/profile", protect, usersCtrl.getProfile);
router.get("/", protect, admin, usersCtrl.getUsers);

export default router;