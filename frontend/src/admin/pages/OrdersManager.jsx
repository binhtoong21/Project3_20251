import React, { useEffect, useState } from "react";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./OrdersManager.css";

export default function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  // Danh sách các trạng thái có thể chọn
  const STATUS_OPTIONS = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Completed"
  ];

  const ESCROW_FILTER_OPTIONS = ["Disputed", "Held"];

  useEffect(() => {
    fetchOrders();
  }, []);

  // Lọc danh sách khi state filter thay đổi
  useEffect(() => {
    if (filter === "All") {
      setFilteredOrders(orders);
    } else if (ESCROW_FILTER_OPTIONS.includes(filter)) {
      setFilteredOrders(orders.filter((order) => order.escrowStatus === filter));
    } else {
      setFilteredOrders(orders.filter((order) => order.status === filter));
    }
  }, [filter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get("/orders/all");
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Hỏi xác nhận trước khi đổi
    if (
      !window.confirm(
        `Bạn có chắc muốn đổi trạng thái đơn này thành "${newStatus}"?`
      )
    )
      return;

    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });

      // Cập nhật lại UI ngay lập tức hoặc fetch lại
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      alert("Cập nhật trạng thái thành công!");
    } catch (error) {
      alert("Lỗi cập nhật: " + error.message);
    }
  };

  return (
    <div className="orders-manager-container">
      <div className="page-header">
        <h2 className="page-title">Quản lý Đơn hàng</h2>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <button
          className={`filter-btn ${filter === "All" ? "active" : ""}`}
          onClick={() => setFilter("All")}
        >
          Tất cả ({orders.length})
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? "active" : ""}`}
            onClick={() => setFilter(status)}
          >
            {status} ({orders.filter((o) => o.status === status).length})
          </button>
        ))}
         <button
            className={`filter-btn ${filter === "Disputed" ? "active" : ""}`}
            onClick={() => setFilter("Disputed")}
            style={{borderColor: 'red', color: filter === 'Disputed' ? 'white' : 'red', backgroundColor: filter === 'Disputed' ? 'red' : 'transparent'}}
        >
            Khiếu nại ({orders.filter((o) => o.escrowStatus === "Disputed").length})
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Ngày đặt</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7">Đang tải danh sách đơn hàng...</td>
            </tr>
          ) : filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="7">Không tìm thấy đơn hàng nào.</td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <strong>#{order._id.substring(0, 8)}...</strong>
                  <div className="order-detail-mini">
                    {order.orderItems?.length} sản phẩm
                  </div>
                </td>
                <td>
                  {order.user ? (
                    order.user.name
                  ) : (
                    <span style={{ color: "red" }}>User đã xóa</span>
                  )}
                  <div className="order-detail-mini">{order.paymentMethod}</div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td style={{ fontWeight: "bold", color: "#2d3748" }}>
                  {formatCurrency(order.totalPrice)}
                </td>
                <td>
                  <select
                    className={`status-select ${order.status.toLowerCase()}`}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    disabled={
                      order.status === "Cancelled" ||
                      order.status === "Delivered" ||
                      order.status === "Completed"
                    }
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                     {order.escrowStatus ? (
                         <span className={`status-badge status-${order.escrowStatus.toLowerCase()}`} style={{fontSize: '0.8rem'}}>
                             {order.escrowStatus}
                         </span>
                     ) : '-'}
                </td>
                <td>
                  {/* Link tới trang chi tiết đơn hàng  */}
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="btn-view"
                    title="Xem chi tiết"
                  >
                    <FaEye /> Xem
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

