import express from 'express';
import { protect, admin } from '../middlewares/auth.middleware.js';
import {
  createDepositRequest,
  approveDeposit,
  getTransactions,
  getPendingDeposits,
  createWithdrawalRequest,
  getPendingWithdrawals,
  updateWithdrawalStatus
} from '../controllers/wallet.controller.js';

const router = express.Router();

// Deposit Routes
router.post('/deposit', protect, createDepositRequest);
router.get('/transactions', protect, getTransactions);
router.get('/pending-deposits', protect, admin, getPendingDeposits);
router.put('/approve/:id', protect, admin, approveDeposit);

// Withdrawal Routes
router.post('/withdraw', protect, createWithdrawalRequest);
router.get('/withdrawals/pending', protect, admin, getPendingWithdrawals);
router.put('/withdrawals/:id', protect, admin, updateWithdrawalStatus);

export default router;
