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
  const { user, setUser } = useAuth(); // Lấy setUser để cập nhật context sau khi lưu địa chỉ
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // State quản lý form địa chỉ
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Việt Nam",
  });

  // Biến kiểm soát xem địa chỉ đã được lưu/đồng bộ với server chưa
  const [isAddressSaved, setIsAddressSaved] = useState(false);

  // Tính toán phí ship và tổng tiền
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
      // Nếu user đã có địa chỉ trong DB, điền sẵn vào form
      if (user.address && user.address.street) {
        setAddressForm({
          street: user.address.street || "",
          city: user.address.city || "",
          state: user.address.state || "",
          postalCode: user.address.postalCode || "",
          country: user.address.country || "Việt Nam",
        });
        setIsAddressSaved(true);
      }
    }
  }, [user, items, navigate]);

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    // Khi người dùng sửa form, đánh dấu là chưa lưu để bắt buộc họ nhấn "Save Address"
    setIsAddressSaved(false);
  };

  const handleSaveAddress = async () => {
    if (!addressForm.street || !addressForm.city) {
      alert("Vui lòng nhập Địa chỉ và Thành phố");
      return;
    }

    setLoading(true);
    try {
      // Gọi API updateAddress bạn đã có ở backend
      const updatedUser = await apiClient.put("/users/profile/address", {
        address: addressForm,
      });

      // Cập nhật lại Auth Context và LocalStorage
      setUser(updatedUser);
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...updatedUser, token: updatedUser.token })
      );

      setIsAddressSaved(true);
      alert("Đã lưu địa chỉ giao hàng!");
    } catch (error) {
      console.error(error);
      alert("Lỗi khi lưu địa chỉ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Chặn đặt hàng nếu chưa lưu địa chỉ
    if (!isAddressSaved) {
      alert("Vui lòng lưu địa chỉ giao hàng trước khi đặt hàng.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingAddress: addressForm,
        paymentMethod: paymentMethod,
      };

      const createdOrder = await apiClient.post("/orders", orderData);

      await refetchCart(); // Làm mới giỏ hàng (về 0)

      alert("Đặt hàng thành công!");
      navigate(`/account/orders/${createdOrder._id}`);
    } catch (error) {
      console.error(error);
      alert(error.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container">Loading checkout info...</div>;

  return (
    <div className="page checkout-page">
      <div className="container">
        <h2>Checkout</h2>

        <div className="checkout-grid">
          <div className="checkout-left">
            {/* Form nhập địa chỉ */}
            <section className="checkout-section">
              <h3>Shipping Address</h3>
              <div
                className="address-form-container"
                style={{ display: "grid", gap: "10px" }}
              >
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={addressForm.street}
                    onChange={handleAddressChange}
                    placeholder="Số nhà, tên đường..."
                    className="form-control"
                    style={{
                      width: "100%",
                      padding: "8px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  className="form-group-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleAddressChange}
                      placeholder="Thành phố"
                      style={{
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label>State / District</label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      placeholder="Quận/Huyện"
                      style={{
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div
                  className="form-group-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div>
                    <label>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={handleAddressChange}
                      placeholder="700000"
                      style={{
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={addressForm.country}
                      onChange={handleAddressChange}
                      disabled
                      style={{
                        width: "100%",
                        padding: "8px",
                        boxSizing: "border-box",
                        backgroundColor: "#f0f0f0",
                      }}
                    />
                  </div>
                </div>

                {/* Nút lưu địa chỉ: Chỉ hiện khi địa chỉ chưa được lưu/bị sửa đổi */}
                {!isAddressSaved && (
                  <button
                    className="btn secondary"
                    onClick={handleSaveAddress}
                    disabled={loading}
                    style={{ marginTop: "10px" }}
                  >
                    {loading ? "Saving..." : "Save Address"}
                  </button>
                )}

                {isAddressSaved && (
                  <div
                    style={{
                      color: "green",
                      marginTop: "10px",
                      fontSize: "0.9em",
                    }}
                  >
                    ✓ Address saved/verified
                  </div>
                )}
              </div>
            </section>

            <section className="checkout-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="radio"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  Cash on Delivery (COD)
                </label>
              </div>
            </section>
          </div>

          <div className="checkout-right">
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {items.map((item) => (
                  <div
                    key={item.book._id || item.book}
                    className="summary-item-row"
                  >
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
                disabled={loading || !isAddressSaved}
                style={{
                  opacity: isAddressSaved ? 1 : 0.6,
                  cursor: isAddressSaved ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>

              {!isAddressSaved && (
                <p
                  style={{
                    fontSize: "0.8em",
                    color: "red",
                    textAlign: "center",
                    marginTop: "5px",
                  }}
                >
                  Please save address to place order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
