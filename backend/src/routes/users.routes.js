import { Router } from "express";
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  updateAddress, 
  getUsers, 
  toggleBlockUser, 
  addBankAccount, 
  removeBankAccount, 
  getUserDetails, 
  updateUserWallet, 
  getUserNotificationCounts,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword
} from "../controllers/users.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";
import { authLimiter, emailLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-email", verifyEmail); // Token check, logic handles validity
router.post("/resend-verification-email", emailLimiter, resendVerificationEmail);
router.post("/forgot-password", emailLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);
router
  .route("/profile")
  .get(protect, getProfile)
  .put(protect, updateProfile);
router.put("/profile/address", protect, updateAddress);
router.post("/bank-accounts", protect, addBankAccount);
router.delete("/bank-accounts/:id", protect, removeBankAccount);
router.get("/notifications/counts", protect, getUserNotificationCounts);

//  Admin routes
router.get("/", protect, admin, getUsers);
router.put("/:id/block", protect, admin, toggleBlockUser);
router.get("/:id/details", protect, admin, getUserDetails);
router.put("/:id/wallet", protect, admin, updateUserWallet);

export default router;