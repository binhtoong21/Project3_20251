import apiClient from "./apiClient";

const walletService = {
  /**
   * Lấy lịch sử giao dịch của người dùng hiện tại
   */
  getTransactions: async () => {
    return await apiClient.get("/wallet/transactions");
  },

  /**
   * Tạo yêu cầu nạp tiền
   * @param {{ amount: number, description: string }} data
   */
  createDepositRequest: (data) => {
    return apiClient.post("/wallet/deposit", data);
  },

  /**
   * Tạo yêu cầu rút tiền
   * @param {{ amount: number, bankInfo: object }} data
   */
  createWithdrawalRequest: (data) => {
    return apiClient.post("/wallet/withdraw", data);
  },
  
  // ===============================================
  // ADMIN
  // ===============================================

  /**
   * Lấy danh sách các yêu cầu nạp tiền đang chờ xử lý
   * @returns {Promise<any[]>}
   */
  getPendingDeposits: () => {
    return apiClient.get("/wallet/pending-deposits");
  },

  /**
   * Phê duyệt một yêu cầu nạp tiền
   * @param {string} transactionId
   * @returns {Promise<any>}
   */
  approveDeposit: (transactionId) => {
    return apiClient.put(`/wallet/approve/${transactionId}`);
  },

  /**
   * Từ chối một yêu cầu nạp tiền (Admin)
   * @param {string} transactionId
   * @returns {Promise<any>}
   */
  rejectDeposit: (transactionId) => {
    return apiClient.put(`/wallet/reject/${transactionId}`);
  },

  /**
   * Lấy danh sách yêu cầu rút tiền đang chờ xử lý (Admin)
   */
  getPendingWithdrawals: () => {
    return apiClient.get("/wallet/withdrawals/pending");
  },

  /**
   * Cập nhật trạng thái yêu cầu rút tiền (Admin)
   * @param {string} transactionId
   * @param {'completed' | 'failed'} status
   */
  updateWithdrawalStatus: (transactionId, status) => {
    return apiClient.put(`/wallet/withdrawals/${transactionId}`, { status });
  },
};

export default walletService;
