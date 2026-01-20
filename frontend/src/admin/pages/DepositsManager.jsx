import React, { useState, useEffect } from "react";
import walletService from "../../shared/utils/walletService";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./DepositsManager.css";

const DepositsManager = () => {
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingDeposits = async () => {
    try {
      setLoading(true);
      const data = await walletService.getPendingDeposits();
      setPendingDeposits(data);
    } catch (err) {
      setError("Không thể tải danh sách yêu cầu nạp tiền.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDeposits();
  }, []);

  const handleApprove = async (transactionId) => {
    if (window.confirm("Bạn có chắc chắn muốn duyệt giao dịch này?")) {
      setApprovingId(transactionId);
      try {
        await walletService.approveDeposit(transactionId);
        // Remove the approved deposit from the list
        setPendingDeposits((prev) =>
          prev.filter((d) => d._id !== transactionId)
        );
      } catch (err) {
        alert("Duyệt giao dịch thất bại: " + err.message);
      } finally {
        setApprovingId(null);
      }
    }
  };

  const handleReject = async (transactionId) => {
    if (window.confirm("Bạn có chắc chắn muốn TỪ CHỐI giao dịch này?")) {
      setApprovingId(transactionId);
      try {
        await walletService.rejectDeposit(transactionId);
        // Remove the rejected deposit from the list
        setPendingDeposits((prev) =>
          prev.filter((d) => d._id !== transactionId)
        );
      } catch (err) {
        alert("Từ chối giao dịch thất bại: " + err.message);
      } finally {
        setApprovingId(null);
      }
    }
  };

  return (
    <div className="deposits-manager-container">
      <h1>Duyệt yêu cầu nạp tiền</h1>
      <p>
        Các yêu cầu nạp tiền từ người dùng đang chờ được xử lý.
      </p>

      {loading && <p>Đang tải danh sách...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table className="deposits-table">
          <thead>
            <tr>
              <th>Ngày tạo</th>
              <th>Người dùng</th>
              <th>Số tiền</th>
              <th>Nội dung</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pendingDeposits.length > 0 ? (
              pendingDeposits.map((deposit) => (
                <tr key={deposit._id}>
                  <td>{formatDate(deposit.createdAt)}</td>
                  <td>
                    <div className="user-info">
                        <span>{deposit.user.name}</span>
                        <small>{deposit.user.email}</small>
                    </div>
                  </td>
                  <td className="amount">{formatCurrency(deposit.amount)}</td>
                  <td>{deposit.description}</td>
                  <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(deposit._id)}
                        disabled={approvingId === deposit._id}
                      >
                        {approvingId === deposit._id ? "Đang xử lý..." : "Duyệt"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(deposit._id)}
                        disabled={approvingId === deposit._id}
                        style={{
                          backgroundColor: '#EF4444',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
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
                  Không có yêu cầu nào đang chờ.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepositsManager;

