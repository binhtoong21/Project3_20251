import React, { useEffect, useState } from "react";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import {
  FaShoppingBag,
  FaBook,
  FaUsers,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTrophy,
  FaChartLine
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

  // Max values for scaling charts
  const maxRevenue = Math.max(...(stats.dailyRevenue?.map((d) => d.revenue) || [0]), 1);
  const maxGrowth = Math.max(...(stats.userGrowth?.map((d) => d.count) || [0]), 1);

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Tổng quan Kinh doanh</h2>

      {/* 1. TOP CARDS */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <h3>Tổng Doanh Thu</h3>
            <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><FaShoppingBag /></div>
          <div className="stat-info">
            <h3>Tổng Đơn Hàng</h3>
            <div className="stat-number">{stats.totalOrders}</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><FaBook /></div>
          <div className="stat-info">
            <h3>Tổng Đầu Sách</h3>
            <div className="stat-number">{stats.totalBooks}</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>Thành Viên</h3>
            <div className="stat-number">{stats.totalUsers}</div>
          </div>
        </div>
      </div>

      {/* 2. CHARTS ROW */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="section-card">
          <div className="section-title">Doanh thu 7 ngày gần nhất</div>
          <div className="chart-bars">
            {stats.dailyRevenue && stats.dailyRevenue.length > 0 ? (
                stats.dailyRevenue.map((day) => {
                const heightPercent = Math.round((day.revenue / maxRevenue) * 100);
                const shortDate = day._id.split("-").slice(1).join("/");
                return (
                    <div className="bar-group" key={day._id}>
                    <div
                        className="bar"
                        style={{ height: `${heightPercent}%` }}
                        data-tooltip={`${formatCurrency(day.revenue)} (${day.count} đơn)`}
                    ></div>
                    <div className="bar-date">{shortDate}</div>
                    </div>
                );
                })
            ) : (
                <div className="no-data-chart">
                    <p>Chưa có doanh thu (đã thanh toán/hoàn tất) trong 7 ngày qua.</p>
                </div>
            )}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="section-card">
          <div className="section-title">
             <FaChartLine style={{ marginRight: '10px', color: '#3b82f6' }} />
             Tăng trưởng thành viên
          </div>
          <div className="chart-bars">
             {stats.userGrowth && stats.userGrowth.length > 0 ? (
                 stats.userGrowth.map((item) => {
                    const heightPercent = Math.round((item.count / maxGrowth) * 100);
                    return (
                        <div className="bar-group" key={item._id}>
                            <div
                                className="bar"
                                style={{ height: `${heightPercent}%`, background: '#8b5cf6' }}
                                data-tooltip={`${item.count} thành viên mới`}
                            ></div>
                            <div className="bar-date">{item._id}</div>
                        </div>
                    );
                 })
             ) : (
                 <div className="no-data-chart">
                     <p>Chưa có thành viên mới trong 6 tháng qua.</p>
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE ROW */}
      <div className="charts-row">
         {/* Category Performance */}
         <div className="section-card">
            <div className="section-title">Doanh thu theo danh mục</div>
            <div className="category-list">
                {stats.categoryStats?.map((cat) => {
                    // Simple calculation for progress bar width relative to total revenue of top categories displayed
                    const totalDisplayed = stats.categoryStats.reduce((acc, c) => acc + c.revenue, 0);
                    const percent = Math.round((cat.revenue / totalDisplayed) * 100);
                    
                    return (
                        <div className="category-item" key={cat._id}>
                            <div className="cat-header">
                                <span>{cat._id}</span>
                                <span>{formatCurrency(cat.revenue)}</span>
                            </div>
                            <div className="progress-bg">
                                <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                            </div>
                        </div>
                    )
                })}
            </div>
         </div>

         {/* Top Moving Books */}
         <div className="section-card">
            <div className="section-title">
                <FaTrophy style={{ marginRight: '10px', color: '#f59e0b' }} />
                Sách bán chạy nhất
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Sách</th>
                        <th>Đã bán</th>
                        <th>Doanh thu</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.topSellingBooks?.map((book) => (
                        <tr key={book._id}>
                            <td>
                                <div className="book-mini-info">
                                    <img src={book.cover} alt="" className="book-cover-mini" onError={(e) => e.target.style.display='none'} />
                                    <span className="text-truncate" title={book.title}>{book.title}</span>
                                </div>
                            </td>
                            <td style={{fontWeight: 'bold'}}>{book.totalSold}</td>
                            <td>{formatCurrency(book.revenue)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>
      </div>

       {/* 4. ALERTS & ORDERS */}
      <div className="charts-row">
          {/* Low Stock Alert */}
          {stats.lowStockBooks && stats.lowStockBooks.length > 0 && (
              <div className="section-card" style={{ borderColor: '#fca5a5' }}>
                  <div className="section-title" style={{ color: '#dc2626' }}>
                      <FaExclamationTriangle style={{ marginRight: '10px' }} />
                      Cảnh báo: Sách sắp hết hàng
                  </div>
                   <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sách</th>
                                <th>Tồn kho</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.lowStockBooks.map((book) => (
                                <tr key={book._id} className="alert-row">
                                    <td>
                                        <div className="book-mini-info">
                                            {book.cover && <img src={book.cover} alt="" className="book-cover-mini" onError={(e) => e.target.style.display='none'} />}
                                            <span className="text-truncate" title={book.title}>{book.title}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 'bold', color: '#dc2626' }}>{book.stock}</td>
                                    <td>
                                        <a href={`/admin/books?edit=${book._id}`} className="stock-badge stock-danger" style={{textDecoration: 'none'}}>
                                            Restock Now
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                   </table>
              </div>
          )}

          {/* Recent Orders */}
          <div className="section-card" style={(!stats.lowStockBooks || stats.lowStockBooks.length === 0) ? { gridColumn: '1 / -1' } : {}}>
            <div className="section-title">Đơn hàng mới nhất</div>
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
                        <td>{formatCurrency(order.totalPrice)}</td>
                        <td>
                            <span className={`status status-${order.status.toLowerCase()}`}>
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

    </div>
  );
}

