import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import walletService from "../../shared/utils/walletService";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./Wallet.css";

const Wallet = () => {
  const { user, refetchUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for deposit form
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState("");
  const [depositError, setDepositError] = useState("");


  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await walletService.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError("Không thể tải lịch sử giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // refetch user data to get the latest wallet balance
    if(refetchUser) refetchUser();
  }, [refetchUser]);

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    setDepositError("");
    setDepositSuccess("");
    setIsSubmitting(true);

    try {
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            setDepositError("Số tiền phải là một số dương.");
            return;
        }

        await walletService.createDepositRequest({ amount: depositAmount, description });
        setDepositSuccess("Yêu cầu nạp tiền của bạn đã được gửi. Vui lòng chờ quản trị viên phê duyệt.");
        setAmount("");
        setDescription("");
        // fetchTransactions(); // fetch transactions again to show the new pending deposit
    } catch (err) {
        setDepositError(err.message || "Đã xảy ra lỗi khi gửi yêu cầu.");
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="wallet-container">
      <h2>Ví của tôi</h2>

      <div className="wallet-balance-card">
        <p>Số dư hiện tại</p>
        <h3>{formatCurrency(user?.walletBalance || 0)}</h3>
      </div>

      <div className="wallet-actions">
        <div className="deposit-section">
          <h4>Nạp tiền vào ví</h4>
          <p>Tạo một yêu cầu nạp tiền và quản trị viên sẽ xử lý sớm nhất.</p>
          <form onSubmit={handleDepositSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Số tiền (VNĐ)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ví dụ: 500000"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Nội dung (Tùy chọn)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Chuyển khoản từ Techcombank"
              />
            </div>

            {depositSuccess && <p className="success-message">{depositSuccess}</p>}
            {depositError && <p className="error-message">{depositError}</p>}


            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Tạo yêu cầu"}
            </button>
          </form>
        </div>
      </div>

      <div className="transaction-history">
        <h4>Lịch sử giao dịch</h4>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : transactions.length === 0 ? (
          <p>Bạn chưa có giao dịch nào.</p>
        ) : (
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Loại</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className={`status-${tx.status}`}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>{tx.type}</td>
                  <td className={tx.amount > 0 ? 'amount-positive' : 'amount-negative'}>
                    {formatCurrency(tx.amount)}
                  </td>
                  <td>{tx.status}</td>
                  <td>{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Wallet;

