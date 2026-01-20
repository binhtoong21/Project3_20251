import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "somethingsecret", {
    expiresIn: "30d",
  });
};

// Tạo verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

//  ĐĂNG KÝ
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Tạo verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ

    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: tokenExpiry,
      isEmailVerified: false,
    });

    if (user) {
      let emailSent = false;
      // Gửi email xác thực
      try {
        await sendVerificationEmail(email, verificationToken);
        emailSent = true;
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Không throw error, user có thể request resend email sau
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailSent: emailSent,
        message: emailSent 
          ? "Registration successful. Please check your email to verify your account." 
          : "Registration successful, but we failed to send the verification email. Please login and request a new one.",
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

//  ĐĂNG NHẬP
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    //check if user is blocked
    if (user && user.isBlocked) {
      res.status(403); // 403 Forbidden
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.");
    }

    // Check if email is verified
    if (user && !user.isEmailVerified) {
      res.status(403);
      throw new Error("Please verify your email before logging in. Check your email for verification link.");
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user._id),
        message: "Login successful",
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

//  LẤY PROFILE
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

//  CẬP NHẬT PROFILE
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.avatar = req.body.avatar || user.avatar;


      user.pickupAddress = req.body.pickupAddress || user.pickupAddress;

      // Nếu có gửi password mới thì cập nhật
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Trả về dữ liệu mới nhất
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

//  CẬP NHẬT ĐỊA CHỈ
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Cập nhật từng trường địa chỉ
      user.address = req.body.address || user.address;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

//  ADMIN: BLOCK/UNBLOCK USER
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Prevent blocking an admin user
    if (user.role === "admin") {
      res.status(403); // Forbidden
      throw new Error("Cannot block an administrator account.");
    }

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"}`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};
//  THÊM TÀI KHOẢN NGÂN HÀNG
export const addBankAccount = async (req, res, next) => {
  try {
    const { bankName, accountNumber, accountName, branch } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const newAccount = { bankName, accountNumber, accountName, branch };
      user.bankAccounts.push(newAccount);
      const updatedUser = await user.save();
      res.json(updatedUser.bankAccounts);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

//  XÓA TÀI KHOẢN NGÂN HÀNG
export const removeBankAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bankAccounts = user.bankAccounts.filter(
        (acc) => acc._id.toString() !== req.params.id
      );
      const updatedUser = await user.save();
      res.json(updatedUser.bankAccounts);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user full profile by ID (Admin)
// @route   GET /api/users/:id/details
// @access  Private/Admin
export const getUserDetails = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }

        // Parallel fetch for speed
        const [orders, transactions] = await Promise.all([
            import("../models/order.model.js").then(({ default: Order }) => 
                Order.find({ user: req.params.id }).sort({ createdAt: -1 })
            ),
            import("../models/transaction.model.js").then(({ default: Transaction }) => 
                Transaction.find({ user: req.params.id }).sort({ createdAt: -1 })
            )
        ]);

        res.json({
            user,
            orders,
            transactions
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Manually adjust user wallet (Admin)
// @route   PUT /api/users/:id/wallet
// @access  Private/Admin
export const updateUserWallet = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { amount, description } = req.body; // amount can be positive (credit) or negative (debit)
        if (!amount || amount === 0) {
             res.status(400);
             throw new Error("Amount is required and cannot be zero.");
        }

        const user = await User.findById(req.params.id).session(session);
        if (!user) {
             res.status(404);
             throw new Error("User not found");
        }

        user.walletBalance += amount;
        await user.save({ session });
        
        // Log transaction
        const Transaction = (await import("../models/transaction.model.js")).default;
        await Transaction.create([{
            user: user._id,
            type: amount > 0 ? 'deposit' : 'withdrawal', // Simply using deposit/withdrawal for manual adjustments
            amount: amount,
            status: 'completed',
            description: description || `Admin ${req.user.name} manually adjusted wallet`,
        }], { session });

        await session.commitTransaction();
        res.json({ success: true, newBalance: user.walletBalance });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Get notification counts for Buyer, Seller, Admin
// @route   GET /api/users/notifications/counts
// @access  Private
export const getUserNotificationCounts = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        // Lazy load models
        const Order = (await import("../models/order.model.js")).default;
        const Transaction = (await import("../models/transaction.model.js")).default;

        const promises = [
            // 1. Buyer: Orders delivered waiting for confirmation (Money Held)
            Order.countDocuments({ user: userId, escrowStatus: 'Held' }),
            
            // 2. Seller: Actionable Orders (Pending Shipment OR Shipped waiting for delivery confirm)
            // If Admin, also include orders where seller is null (B2C)
            Order.countDocuments({
                $and: [
                    isAdmin 
                        ? { $or: [{ "orderItems.seller": userId }, { "orderItems.seller": null }, { "orderItems.seller": { $exists: false } }] }
                        : { "orderItems.seller": userId },
                    { status: { $in: ['Pending', 'Shipped'] } }
                ]
            }),

            // 3. Seller: Disputed orders OR Return Requested
            Order.countDocuments({
                $and: [
                    isAdmin 
                        ? { $or: [{ "orderItems.seller": userId }, { "orderItems.seller": null }, { "orderItems.seller": { $exists: false } }] }
                        : { "orderItems.seller": userId },
                    { escrowStatus: { $in: ['Disputed', 'ReturnRequested'] } }
                ]
            }),
        ];

        if(isAdmin) {
             promises.push(
                // 4. Admin: Pending Deposits
                Transaction.countDocuments({ type: 'deposit', status: 'pending' }),
                // 5. Admin: Pending Withdrawals
                Transaction.countDocuments({ type: 'withdrawal', status: 'pending' }),
                // 6. Admin: Disputed Orders
                Order.countDocuments({ escrowStatus: 'Disputed' })
             );
        }

        const results = await Promise.all(promises);

        const response = {
            buyer: {
                toConfirm: results[0] || 0
            },
            seller: {
                toShip: results[1] || 0,
                disputed: results[2] || 0
            },
            admin: isAdmin ? {
                 pendingDeposits: results[3] || 0,
                 pendingWithdrawals: results[4] || 0,
                 disputedOrders: results[5] || 0
            } : {}
        };
        
        // Total badges
        response.buyer.total = response.buyer.toConfirm;
        response.seller.total = response.seller.toShip + response.seller.disputed;
        response.admin.total = (response.admin.pendingDeposits || 0) + (response.admin.pendingWithdrawals || 0) + (response.admin.disputedOrders || 0);

        res.json(response);

    } catch (error) {
        next(error);
    }
};

// XÁC THỰC EMAIL
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("Verification token is required");
    }

    // Tìm user với token và check token chưa hết hạn
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired verification token");
    }

    // Cập nhật user
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      token: generateToken(user._id),
      message: "Email verified successfully. You can now login!",
    });
  } catch (error) {
    next(error);
  }
};

// GỬI LẠI EMAIL XÁC THỰC
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.isEmailVerified) {
      res.status(400);
      throw new Error("Email is already verified");
    }

    // Tạo token mới
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save();

    // Gửi email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      throw new Error("Failed to send verification email");
    }

    res.json({
      message: "Verification email has been resent. Please check your email.",
    });
  } catch (error) {
    next(error);
  }
};

// GỬI EMAIL ĐẶT LẠI MẬT KHẨU
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Tạo reset token
    const resetToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = tokenExpiry;
    await user.save();

    // Gửi email
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      throw new Error("Failed to send password reset email");
    }

    res.json({
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

// ĐẶT LẠI MẬT KHẨU
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400);
      throw new Error("Token and new password are required");
    }

    // Tìm user với token và check token chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    // Cập nhật password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    await user.save();

    res.json({
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
