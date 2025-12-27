import express from 'express';
import { protect, admin } from '../middlewares/auth.middleware.js';
import {
  createDepositRequest,
  approveDeposit,
  getTransactions,
  getPendingDeposits,
} from '../controllers/wallet.controller.js';

const router = express.Router();

// @desc    Tạo yêu cầu nạp tiền
// @route   POST /api/wallet/deposit
// @access  Private
router.post('/deposit', protect, createDepositRequest);

// @desc    Lấy lịch sử giao dịch của user
// @route   GET /api/wallet/transactions
// @access  Private
router.get('/transactions', protect, getTransactions);

// @desc    Admin duyệt yêu cầu nạp tiền
// @route   PUT /api/wallet/approve/:id
// @access  Private/Admin
router.put('/approve/:id', protect, admin, approveDeposit);

// @desc    Admin xem các yêu cầu nạp tiền đang chờ
// @route   GET /api/wallet/pending-deposits
// @access  Private/Admin
router.get('/pending-deposits', protect, admin, getPendingDeposits);

export default router;
