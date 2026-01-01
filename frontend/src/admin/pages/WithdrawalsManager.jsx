import React, { useState, useEffect } from "react";
import walletService from "../../shared/utils/walletService";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./DepositsManager.css"; // Reuse styling

const WithdrawalsManager = () => {
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await walletService.getPendingWithdrawals();
      setPendingWithdrawals(data);
    } catch (err) {
      setError("Không thể tải danh sách yêu cầu rút tiền.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWithdrawals();
  }, []);

  const handleUpdateStatus = async (transactionId, status) => {
    const actionText = status === 'completed' ? 'DUYỆT' : 'TỪ CHỐI';
    if (!window.confirm(`Bạn có chắc muốn ${actionText} yêu cầu rút tiền này?`)) return;

    setProcessingId(transactionId);
    try {
      await walletService.updateWithdrawalStatus(transactionId, status);
      // Remove the processed withdrawal from the list
      setPendingWithdrawals((prev) =>
        prev.filter((w) => w._id !== transactionId)
      );
      alert(`Đã ${actionText} thành công!`);
    } catch (err) {
      alert(`Xử lý thất bại: ` + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="deposits-manager-container">
      <h1>Duyệt yêu cầu rút tiền</h1>
      <p>
        Các yêu cầu rút tiền từ người dùng đang chờ được xử lý.
      </p>

      {loading && <p>Đang tải danh sách...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="deposits-table">
          <thead>
            <tr>
              <th>Ngày tạo</th>
              <th>Người dùng</th>
              <th>Số tiền Rút</th>
              <th>Ngân hàng nhận</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pendingWithdrawals.length > 0 ? (
              pendingWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id}>
                  <td>{formatDate(withdrawal.createdAt)}</td>
                  <td>
                    <div className="user-info">
                        <span>{withdrawal.user?.name || "Unknown"}</span>
                        <small>{withdrawal.user?.email}</small>
                        <small>{withdrawal.user?.phone}</small>
                    </div>
                  </td>
                  <td className="amount" style={{color: '#dc3545'}}>
                      {formatCurrency(Math.abs(withdrawal.amount))}
                  </td>
                  <td>
                      {withdrawal.bankInfo ? (
                          <div>
                              <strong>{withdrawal.bankInfo.bankName}</strong>
                              <div style={{fontFamily: 'monospace'}}>{withdrawal.bankInfo.accountNumber}</div>
                              <small>{withdrawal.bankInfo.accountName}</small>
                          </div>
                      ) : (
                          <span style={{color: 'red'}}>Thiếu thông tin NH</span>
                      )}
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <button
                        className="btn-approve"
                        onClick={() => handleUpdateStatus(withdrawal._id, 'completed')}
                        disabled={processingId === withdrawal._id}
                        >
                        {processingId === withdrawal._id ? "..." : "Duyệt"}
                        </button>
                        <button
                        className="btn-reject"
                        style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'}}
                        onClick={() => handleUpdateStatus(withdrawal._id, 'failed')}
                        disabled={processingId === withdrawal._id}
                        >
                        Từ chối
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  Không có yêu cầu rút tiền nào đang chờ.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WithdrawalsManager;
