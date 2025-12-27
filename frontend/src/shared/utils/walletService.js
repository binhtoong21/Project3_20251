import apiClient from "./apiClient";

const walletService = {
  /**
   * Lấy lịch sử giao dịch của người dùng hiện tại
   */
  getTransactions: () => {
    return apiClient.get("/wallet/transactions");
  },

  /**
   * Tạo yêu cầu nạp tiền
   * @param {{ amount: number, description: string }} data
   */
  createDepositRequest: (data) => {
    return apiClient.post("/wallet/deposit", data);
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
};

export default walletService;
