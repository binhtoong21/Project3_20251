import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/orders/${id}`);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch order details.");
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="container">Loading order details...</div>;
  if (error)
    return (
      <div className="container error-message">
        Error: {error} Please make sure you are logged in and the order exists.
      </div>
    );
  if (!order) return <div className="container">Order not found.</div>;

  return (
    <div className="page order-detail-page">
      <div className="container">
        <h2 className="page-title">
          Order Details #{order._id.substring(0, 7)}...
        </h2>
        <p className="order-date">
          Placed on: <strong>{formatDate(order.createdAt)}</strong>
        </p>

        <div className="order-detail-grid">
          <div className="order-detail-left">
            {/* Shipping Info */}
            <div className="detail-card">
              <h3>Shipping Address</h3>
              <p>
                <strong>{order.user.name}</strong>
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>

            {/* Payment Info */}
            <div className="detail-card">
              <h3>Payment</h3>
              <p>
                Payment Method: <strong>{order.paymentMethod}</strong>
              </p>
              {order.isPaid ? (
                <div className="status-badge paid">
                  Paid on {formatDate(order.paidAt)}
                </div>
              ) : (
                <div className="status-badge not-paid">Not Paid</div>
              )}
            </div>
            {/* Order Status */}
            <div className="detail-card">
              <h3>Order Status</h3>
              <p>
                Current Status:{" "}
                <strong
                  className={`status-text status-text-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </strong>
              </p>
              {order.isDelivered ? (
                <div className="status-badge delivered">
                  Delivered on {formatDate(order.deliveredAt)}
                </div>
              ) : (
                <div className="status-badge not-delivered">Not Delivered</div>
              )}
            </div>
          </div>

          <div className="order-detail-right">
            {/* Order Summary */}
            <div className="detail-card summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {order.orderItems.map((item) => (
                  <div key={item.book} className="summary-item-row">
                    <div className="item-info">
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="item-image"
                      />
                      <div>
                        <span className="item-title">{item.title}</span>
                        <span className="item-qty">
                          Quantity: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.itemsPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatCurrency(order.shippingPrice)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
            <Link to="/account/orders" className="btn-back">
              &larr; Back to Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

