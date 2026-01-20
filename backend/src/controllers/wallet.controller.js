  import asyncHandler from "express-async-handler";
  import mongoose from "mongoose";
  import Transaction from "../models/transaction.model.js";
  import User from "../models/user.model.js";

  // @desc    Tạo yêu cầu nạp tiền
  // @route   POST /api/wallet/deposit
  // @access  Private
  const createDepositRequest = asyncHandler(async (req, res) => {
    const { amount, description } = req.body;

    if (!amount || amount < 10000) {
      res.status(400);
      throw new Error("Số tiền nạp vào tối thiểu là 10,000 VNĐ.");
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await Transaction.findById(transactionId).session(session);

      if (!transaction) {
        res.status(404);
        throw new Error("Không tìm thấy giao dịch.");
      }

      if (transaction.status !== "pending" || transaction.type !== "deposit") {
        res.status(400);
        throw new Error("Giao dịch không hợp lệ hoặc đã được xử lý.");
      }

      const user = await User.findById(transaction.user).session(session);
      if (!user) {
        res.status(404);
        throw new Error("Không tìm thấy người dùng của giao dịch này.");
      }

      // Cập nhật trạng thái giao dịch
      transaction.status = "completed";
      await transaction.save({ session });

      // Cộng tiền vào ví user
      user.walletBalance += transaction.amount;
      await user.save({ session });
      
      await session.commitTransaction();
      res.json({ message: "Giao dịch đã được duyệt và tiền đã được cộng vào ví." });

    } catch (error) {
      await session.abortTransaction();
      res.status(500);
      throw new Error(`Duyệt giao dịch thất bại: ${error.message}`);
    } finally {
      session.endSession();
    }
  });

  // @desc    Admin từ chối yêu cầu nạp tiền
  // @route   PUT /api/wallet/reject/:id
  // @access  Private/Admin
  const rejectDeposit = asyncHandler(async (req, res) => {
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      res.status(404);
      throw new Error("Không tìm thấy giao dịch.");
    }

    if (transaction.status !== "pending" || transaction.type !== "deposit") {
      res.status(400);
      throw new Error("Giao dịch không hợp lệ hoặc đã được xử lý.");
    }

    // Cập nhật trạng thái giao dịch thành failed
    transaction.status = "failed";
    transaction.description = (transaction.description || "") + " (Bị từ chối bởi Admin)";
    await transaction.save();

    res.json({ message: "Yêu cầu nạp tiền đã bị từ chối." });
  });

  export {
    createDepositRequest,
    getTransactions,
    getPendingDeposits,
    approveDeposit,
    rejectDeposit,
  };
  // @desc    Create a withdrawal request
  // @route   POST /api/wallet/withdraw
  // @access  Private
  export const createWithdrawalRequest = async (req, res, next) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
          const { amount, bankInfo } = req.body;
          const user = await User.findById(req.user._id).session(session);

          if (amount < 50000) {
              res.status(400);
              throw new Error("Số tiền rút tối thiểu là 50,000 VNĐ");
          }

          if (user.walletBalance < amount) {
              res.status(400);
              throw new Error("Số dư không đủ");
          }

          // Deduct balance immediately
          user.walletBalance -= amount;
          await user.save({ session });

          const transaction = await Transaction.create([{
              user: req.user._id,
              type: "withdrawal",
              amount: -amount,
              status: "pending",
              description: "Yêu cầu rút tiền",
              bankInfo: bankInfo // Store snapshot of bank details
          }], { session });

          await session.commitTransaction();
          res.status(201).json(transaction[0]);

      } catch (error) {
          await session.abortTransaction();
          next(error);
      } finally {
          session.endSession();
      }
  };

  // @desc    Get all pending withdrawals (Admin)
  // @route   GET /api/wallet/withdrawals/pending
  // @access  Private/Admin
  export const getPendingWithdrawals = async (req, res, next) => {
      try {
          const withdrawals = await Transaction.find({ type: "withdrawal", status: "pending" })
              .populate("user", "name email phone bankAccount") // Ensure bankAccount exists in User model or just contact info
              .sort({ createdAt: -1 });
          res.json(withdrawals);
      } catch (error) {
          next(error);
      }
  };

  // @desc    Approve or Reject withdrawal
  // @route   PUT /api/wallet/withdrawals/:id
  // @access  Private/Admin
  export const updateWithdrawalStatus = async (req, res, next) => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
          const { status } = req.body; // 'completed' (Approve) or 'failed' (Reject)
          const transaction = await Transaction.findById(req.params.id).session(session);

          if (!transaction) {
              res.status(404);
              throw new Error("Transaction not found");
          }

          if (transaction.type !== "withdrawal" || transaction.status !== "pending") {
              res.status(400);
              throw new Error("Invalid transaction or already processed");
          }

          if (status === "completed") {
              // Admin confirms transfer done outside system
              transaction.status = "completed";
              await transaction.save({ session });
          } else if (status === "failed") {
              // Admin rejects -> Refund balance
              transaction.status = "failed";
              await transaction.save({ session });

              await User.findByIdAndUpdate(transaction.user, {
                  $inc: { walletBalance: Math.abs(transaction.amount) } // Refund absolute amount
              }).session(session);
          } else {
              res.status(400);
              throw new Error("Invalid status. Use 'completed' or 'failed'.");
          }

          await session.commitTransaction();
          res.json(transaction);

      } catch (error) {
          await session.abortTransaction();
          next(error);
      } finally {
          session.endSession();
      }
  };
