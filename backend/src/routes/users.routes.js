import { Router } from "express";
import { register, login, getProfile, updateProfile, updateAddress, getUsers, toggleBlockUser, addBankAccount, removeBankAccount, getUserDetails, updateUserWallet } from "../controllers/users.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router
  .route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);
router.put("/profile/address", protect, updateAddress);
router.post("/bank-accounts", protect, addBankAccount);
router.delete("/bank-accounts/:id", protect, removeBankAccount);

//  Admin routes
router.get("/", protect, admin, getUsers);
router.put("/:id/block", protect, admin, toggleBlockUser);
router.get("/:id/details", protect, admin, getUserDetails);
router.put("/:id/wallet", protect, admin, updateUserWallet);

export default router;