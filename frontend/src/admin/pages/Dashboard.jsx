import React, { useEffect, useState } from "react";
import apiClient from "../../shared/utils/apiClient";
import { formatPrice, formatDate } from "../../shared/utils/formatters";
import {
  FaShoppingBag,
  FaBook,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Gọi API Dashboard
        const data = await apiClient.get("/dashboard");
        setStats(data);
      } catch (err) {
        console.error("Dashboard load failed", err);
        setError("Không thể tải dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading)
    return <div className="admin-loading">Đang tải Dashboard...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!stats) return null;

  // Tìm doanh thu cao nhất trong 7 ngày để tính chiều cao cột biểu đồ
  const maxRevenue = Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Tổng quan</h2>

      {/*  CARDS THỐNG KÊ */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <FaMoneyBillWave />
          </div>
          <div className="stat-info">
            <h3>Tổng Doanh Thu</h3>
            <div className="stat-number">{formatPrice(stats.totalRevenue)}</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <FaShoppingBag />
          </div>
          <div className="stat-info">
            <h3>Tổng Đơn Hàng</h3>
            <div className="stat-number">{stats.totalOrders}</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-info">
            <h3>Tổng Đầu Sách</h3>
            <div className="stat-number">{stats.totalBooks}</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <h3>Thành Viên</h3>
            <div className="stat-number">{stats.totalUsers}</div>
          </div>
        </div>
      </div>

      {/*  BIỂU ĐỒ DOANH THU 7 NGÀY  */}
      <div className="chart-section">
        <h3>Doanh thu 7 ngày gần nhất</h3>
        <div className="chart-bars">
          {stats.dailyRevenue.map((day) => {
            // Tính chiều cao cột theo % so với maxRevenue
            const heightPercent = Math.round((day.revenue / maxRevenue) * 100);
            const shortDate = day._id.split("-").slice(1).join("/");

            return (
              <div className="bar-group" key={day._id}>
                <div
                  className="bar"
                  style={{ height: `${heightPercent}%` }}
                  data-tooltip={`${formatPrice(day.revenue)} (${
                    day.count
                  } đơn)`}
                ></div>
                <div className="bar-date">{shortDate}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/*  BẢNG ĐƠN HÀNG MỚI NHẤT */}
      <div className="recent-orders-section">
        <h3>Đơn hàng mới nhất</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.length === 0 ? (
              <tr>
                <td colSpan="5">Chưa có đơn hàng nào.</td>
              </tr>
            ) : (
              stats.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.substring(0, 6)}...</td>
                  <td>{order.user ? order.user.name : "Unknown"}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <span
                      className={`status status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
