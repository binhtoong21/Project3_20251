import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../shared/utils/apiClient";
import { formatPrice, formatDate } from "../../shared/utils/formatters";
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

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="order-history-container">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td data-label="Order ID">#{order._id.substring(0, 7)}...</td>
                <td data-label="Date">{formatDate(order.createdAt)}</td>
                <td data-label="Total">{formatPrice(order.totalPrice)}</td>
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
                    View Details
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