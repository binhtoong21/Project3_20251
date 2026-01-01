import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMySales } from '../../shared/utils/orderService';
import './MySales.css';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';

const MySales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const salesData = await getMySales();
        setSales(salesData);
      } catch (err) {
        setError('Không thể tải lịch sử bán hàng. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="my-sales-container">
      <h2>Đơn hàng đã bán</h2>
      {sales.length === 0 ? (
        <p>Bạn chưa bán được sản phẩm nào.</p>
      ) : (
        <div className="sales-list">
          {sales.map((sale) => (
            <div key={sale.orderId + sale.item.title} className="sale-item-card">
              <div className="sale-item-header">
                <span>Đơn hàng: #{sale.orderId.slice(-6)}</span>
                <span className={`status-badge status-${sale.status.toLowerCase()}`}>{sale.status}</span>
              </div>
              <div className="sale-item-body">
                <img src={sale.item.cover} alt={sale.item.title} className="sale-item-cover" />
                <div className="sale-item-details">
                  <p className="item-title">{sale.item.title}</p>
                  <p>Số lượng: {sale.item.quantity}</p>
                  <p>Giá bán: {formatCurrency(sale.item.price)}</p>
                  <p>Tổng tiền: <strong>{formatCurrency(sale.totalSaleValue)}</strong></p>
                </div>
              </div>
              <div className="sale-item-footer">
                <div className="buyer-info">
                  <p><strong>Người mua:</strong> {sale.buyer.name}</p>
                  <p><strong>Ngày đặt:</strong> {formatDate(sale.soldAt)}</p>
                </div>
                <div className="shipping-info">
                  <p><strong>Địa chỉ giao hàng:</strong></p>
                  <p>{sale.shippingAddress.name}, {sale.shippingAddress.phone}</p>
                  <p>{`${sale.shippingAddress.street}, ${sale.shippingAddress.ward}, ${sale.shippingAddress.district}, ${sale.shippingAddress.province}`}</p>
                </div>
                <div className="sale-actions" style={{ marginTop: '10px', textAlign: 'right' }}>
                    <Link to={`/orders/${sale.orderId}`} className="btn secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Xem chi tiết & Xử lý đơn
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySales;
