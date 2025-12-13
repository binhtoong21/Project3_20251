import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCartState, useCartActions } from "../../shared/context/CartContext";
import { useAuth } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { formatPrice } from "../../shared/utils/formatters";
import "./Checkout.css";

const Checkout = () => {
  const { items, subtotal } = useCartState();
  const { refetchCart } = useCartActions();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Replicate backend shipping logic
  const shippingPrice = useMemo(
    () => (subtotal > 100000 ? 0 : 30000),
    [subtotal]
  );
  const totalPrice = useMemo(
    () => subtotal + shippingPrice,
    [subtotal, shippingPrice]
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (items.length === 0) {
      navigate("/cart");
    } else {
      if (user.address && user.address.street) {
        setAddress(user.address);
      } else {
        alert("Please update your shipping address in your profile first.");
        navigate("/account"); // Navigate to general account page
      }
    }
  }, [user, items, navigate]);

  const handlePlaceOrder = async () => {
    if (!address) return;
    setLoading(true);
    try {
      // Simplified payload, backend will calculate prices and get items from cart
      const orderData = {
        shippingAddress: address,
        paymentMethod: paymentMethod,
      };

      const createdOrder = await apiClient.post("/orders", orderData);
      
      await refetchCart();

      alert("Order placed successfully!");
      // Assuming you will create an Order Details page
      navigate(`/account/orders/${createdOrder._id}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !address)
    return <div className="container">Loading checkout info...</div>;

  return (
    <div className="page checkout-page">
      <div className="container">
        <h2>Checkout</h2>

        <div className="checkout-grid">
          <div className="checkout-left">
            <section className="checkout-section">
              <h3>Shipping Address</h3>
              <div className="address-card">
                <p>
                  <strong>{user.name}</strong>
                </p>
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p>{address.country}</p>
                <button
                  className="link-button"
                  onClick={() => navigate("/account")}
                >
                  Change Address
                </button>
              </div>
            </section>

            <section className="checkout-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label>
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash on Delivery (COD)
                </label>
                <label>
                  <input
                    type="radio"
                    value="Banking"
                    checked={paymentMethod === "Banking"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled // Example: disable if not implemented
                  />
                  Bank Transfer (Coming Soon)
                </label>
              </div>
            </section>
          </div>

          <div className="checkout-right">
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {items.map((item) => (
                  <div key={item.book} className="summary-item-row">
                    <span>
                      {item.quantity} x {item.title}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{formatPrice(shippingPrice)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <button
                className="btn primary full-width"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

