import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./OrderHistory.css";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get("/orders/myorders");
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch orders.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Tab State
  const [activeTab, setActiveTab] = useState("ALL");

  const filteredOrders = orders.filter(order => {
      if (activeTab === "ALL") return true;
      if (activeTab === "PENDING") return order.status === "Pending" || order.status === "Processing"; // Group Pending & Processing
      if (activeTab === "SHIPPING") return order.status === "Shipped";
      if (activeTab === "COMPLETED") return order.status === "Delivered" || order.status === "Completed";
      if (activeTab === "CANCELLED") return order.status === "Cancelled";
      return true;
  });

  const tabs = [
      { id: "ALL", label: "Tất cả" },
      { id: "PENDING", label: "Chờ xác nhận" },
      { id: "SHIPPING", label: "Đang giao" },
      { id: "COMPLETED", label: "Hoàn thành" },
      { id: "CANCELLED", label: "Đã hủy" },
  ];

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="order-history-container">
      <h2>Lịch sử mua hàng</h2>
      
      {/* Tabs */}
      <div className="order-tabs">
          {tabs.map(tab => (
              <button 
                key={tab.id} 
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
             <p>Không tìm thấy đơn hàng nào.</p>
             <Link to="/books" className="btn-view">Mua sắm ngay</Link>
        </div>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td data-label="Order ID">#{order._id.substring(0, 7)}...</td>
                <td data-label="Date">{formatDate(order.createdAt)}</td>
                <td data-label="Total">{formatCurrency(order.totalPrice)}</td>
                <td data-label="Status">
                  <span className={`status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td data-label="Action">
                  <Link
                    to={`/orders/${order._id}`}
                    className="btn-view"
                  >
                    Xem chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
