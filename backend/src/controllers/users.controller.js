import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "somethingsecret", {
    expiresIn: "30d",
  });
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

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        token: generateToken(user._id),
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
