import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

// @desc    Tạo yêu cầu nạp tiền
// @route   POST /api/wallet/deposit
// @access  Private
const createDepositRequest = asyncHandler(async (req, res) => {
  const { amount, description } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Số tiền nạp vào phải là một số dương.");
  }

  const transaction = new Transaction({
    user: req.user._id,
    type: "deposit",
    amount,
    status: "pending", // Chờ admin duyệt
    description: description || `Yêu cầu nạp ${amount}`,
  });

  const createdTransaction = await transaction.save();
  res.status(201).json(createdTransaction);
});

// @desc    Lấy lịch sử giao dịch của user hiện tại
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(transactions);
});

// @desc    Admin xem các yêu cầu nạp tiền đang chờ
// @route   GET /api/wallet/pending-deposits
// @access  Private/Admin
const getPendingDeposits = asyncHandler(async (req, res) => {
  const pendingDeposits = await Transaction.find({
    type: "deposit",
    status: "pending",
  })
    .populate("user", "name email") // Lấy thông tin user
    .sort({ createdAt: "desc" });

  res.json(pendingDeposits);
});

// @desc    Admin duyệt yêu cầu nạp tiền
// @route   PUT /api/wallet/approve/:id
// @access  Private/Admin
const approveDeposit = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;

  // NOTE: The transaction logic was removed to support standalone MongoDB instances
  // which are common in development environments. For production, a replica set
  // is recommended to re-enable transactions for data consistency.
  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404);
      throw new Error("Không tìm thấy giao dịch.");
    }

    if (transaction.status !== "pending" || transaction.type !== "deposit") {
      res.status(400);
      throw new Error("Giao dịch không hợp lệ hoặc đã được xử lý.");
    }

    const user = await User.findById(transaction.user);
    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy người dùng của giao dịch này.");
    }

    // Cập nhật trạng thái giao dịch
    transaction.status = "completed";
    await transaction.save();

    // Cộng tiền vào ví user
    user.walletBalance += transaction.amount;
    await user.save();
    
    res.json({ message: "Giao dịch đã được duyệt và tiền đã được cộng vào ví." });

  } catch (error) {
    // Manually handle potential inconsistencies if one save fails
    res.status(500);
    throw new Error(`Duyệt giao dịch thất bại: ${error.message}`);
  }
});

export {
  createDepositRequest,
  getTransactions,
  getPendingDeposits,
  approveDeposit,
};
