import React, { useEffect, useState } from "react";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import { FaEye, FaCheckCircle, FaTimesCircle, FaGavel } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./DisputesManager.css";

export default function DisputesManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal
  const [actionType, setActionType] = useState(null); // 'refund' | 'release'

  useEffect(() => {
    fetchDisputedOrders();
  }, []);

  const fetchDisputedOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/orders/all");
      // Filter primarily for 'Disputed' or 'ReturnRequested' (Escalated)
      // Also potentially 'Held' if admin wants to force intervene, but normally focus on Disputed.
      const disputed = data.filter(order => 
          order.escrowStatus === 'Disputed' || 
          order.escrowStatus === 'ReturnRequested' ||
          (order.escrowStatus === 'Held' && order.status === 'Processing') // Monitor held orders
      );
      setOrders(disputed);
    } catch (error) {
      console.error("Failed to load disputes", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order, type) => {
    setSelectedOrder(order);
    setActionType(type);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setActionType(null);
  };

  const handleResolve = async () => {
    if (!selectedOrder || !actionType) return;

    try {
      // API call to resolve
      // backend: /orders/:id/resolve-dispute body: { decision: 'refund' | 'release' }
      await apiClient.put(`/orders/${selectedOrder._id}/resolve-dispute`, {
        decision: actionType
      });

      alert(`Đã ${actionType === 'refund' ? 'Hoàn tiền cho khách' : 'Giải ngân cho người bán'} thành công!`);
      closeModal();
      fetchDisputedOrders(); // Refresh list

    } catch (error) {
       alert("Lỗi xử lý: " + (error.response?.data?.message || error.message));
    }
  };

  // Stats
  const disputedCount = orders.filter(o => o.escrowStatus === 'Disputed').length;
  const returnReqCount = orders.filter(o => o.escrowStatus === 'ReturnRequested').length;
  const heldCount = orders.filter(o => o.escrowStatus === 'Held').length;

  return (
    <div className="disputes-manager-container">
      <div className="page-header">
        <h2 className="page-title">
            <FaGavel style={{marginRight: '10px'}}/>
            Trung tâm Giải quyết Khiếu nại
        </h2>
      </div>

      <div className="disputes-stats">
          <div className="dispute-stat-card red">
              <h4>Đang tranh chấp</h4>
              <div className="value">{disputedCount}</div>
          </div>
          <div className="dispute-stat-card yellow">
              <h4>Yêu cầu trả hàng</h4>
              <div className="value">{returnReqCount}</div>
          </div>
          <div className="dispute-stat-card green">
              <h4>Đang giữ tiền (Held)</h4>
              <div className="value">{heldCount}</div>
          </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Bên mua</th>
            <th>Bên bán</th>
            <th>Giá trị</th>
            <th>Trạng thái Ví</th>
            <th>Lý do khiếu nại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="7">Đang tải...</td></tr>
          ) : orders.length === 0 ? (
            <tr><td colSpan="7">Hiện không có đơn hàng nào cần xử lý.</td></tr>
          ) : (
            orders.map((order) => {
                 // Identify Seller (Simple Logic: Look at first item's seller)
                // In Mixed Order, might be multiple, but usually dispute logic focuses on C2C items.
                const sellerName = order.orderItems[0]?.seller?.name || "Shop/Unknown"; 
                
                return (
              <tr key={order._id}>
                <td>
                    <Link to={`/admin/orders/${order._id}`} style={{fontWeight: 'bold', color: '#2563eb'}}>
                        #{order._id.substring(0, 6)}...
                    </Link>
                </td>
                <td>{order.user?.name || "Deleted User"}</td>
                <td>{sellerName}</td>
                <td>{formatCurrency(order.totalPrice)}</td>
                <td>
                    <span className={`status-badge status-${order.escrowStatus?.toLowerCase()}`}>
                        {order.escrowStatus}
                    </span>
                </td>
                <td style={{maxWidth: '300px'}}>
                    {order.disputeReason ? (
                        <div className="dispute-reason-text" title={order.disputeReason}>
                            {order.disputeReason.length > 50 
                                ? order.disputeReason.substring(0, 50) + '...' 
                                : order.disputeReason}
                        </div>
                    ) : (
                        <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Không có lý do</span>
                    )}
                </td>
                <td>
                    {order.escrowStatus !== 'Held' && ( // Only show resolve buttons if there is an active dispute/return issue
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button 
                                className="btn-success" 
                                style={{padding: '5px 10px', fontSize: '12px'}}
                                onClick={() => openModal(order, 'release')}
                                title="Bác bỏ khiếu nại, trả tiền cho người bán"
                            >
                                <FaCheckCircle /> Release
                            </button>
                            <button 
                                className="btn-danger" 
                                style={{padding: '5px 10px', fontSize: '12px'}}
                                onClick={() => openModal(order, 'refund')}
                                title="Chấp nhận khiếu nại, hoàn tiền cho khách"
                            >
                                <FaTimesCircle /> Refund
                            </button>
                        </div>
                    )}
                     {order.escrowStatus === 'Held' && (
                        <span style={{fontSize: '12px', color: '#64748b'}}>Wait for buyer confirm</span>
                    )}
                </td>
              </tr>
            )})
          )}
        </tbody>
      </table>

      {/* CONFIRMATION MODAL */}
      {selectedOrder && (
          <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <h3 className="modal-title">
                      Xác nhận {actionType === 'refund' ? 'Hoàn tiền' : 'Giải ngân'} 
                  </h3>
                  <div className="modal-body">
                      <p>Bạn đang thực hiện dứng xử lý cho đơn hàng <b>#{selectedOrder._id}</b>.</p>
                      
                      <div className="dispute-reason-box">
                          <strong>Lý do tranh chấp:</strong> {selectedOrder.disputeReason || "Không có"}
                      </div>

                      {actionType === 'refund' ? (
                          <p style={{color: '#ef4444'}}>
                              Hành động này sẽ <b>trả lại {formatCurrency(selectedOrder.totalPrice)}</b> vào ví người mua và hủy đơn hàng.
                              <br/>Người bán sẽ được nhận lại tồn kho sách.
                          </p>
                      ) : (
                          <p style={{color: '#22c55e'}}>
                              Hành động này sẽ <b>chuyển tiền</b> cho người bán (trừ phí sàn).
                              <br/>Khiếu nại của người mua sẽ bị bác bỏ.
                          </p>
                      )}
                  </div>
                  <div className="modal-actions">
                      <button className="btn-secondary" onClick={closeModal}>Hủy bỏ</button>
                      <button 
                        className={actionType === 'refund' ? "btn-danger" : "btn-success"}
                        onClick={handleResolve}
                      >
                          Xác nhận {actionType === 'refund' ? 'Refund' : 'Release'}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}
