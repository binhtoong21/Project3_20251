import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCartState, useCartActions } from "../../shared/context/CartContext";
import { useAuth } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { formatPrice } from "../../shared/utils/formatters";
import { isValidAddress, isValidPhone } from "../../shared/utils/validators";
import "./Checkout.css";

const Checkout = () => {
  const { items, subtotal } = useCartState();
  const { refetchCart } = useCartActions();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const hasValidPhone = user && user.phone && isValidPhone(user.phone);

  const [addressForm, setAddressForm] = useState({
    street: "",
    ward: "",
    district: "",
    province: "",
    country: "Việt Nam",
  });

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
      if (user.address && isValidAddress(user.address)) {
        setAddressForm({
          street: user.address.street || "",
          ward: user.address.ward || "",
          district: user.address.district || "",
          province: user.address.province || "",
          country: user.address.country || "Việt Nam",
        });
        setIsEditingAddress(false);
      } else {
        setIsEditingAddress(true);
      }
    }
  }, [user, items, navigate]);

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSaveAddress = async () => {
    if (!isValidAddress(addressForm)) {
      setErrorMsg("Vui lòng điền đầy đủ Tỉnh, Huyện, Xã và Đường.");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await apiClient.put("/users/profile/address", {
        address: addressForm,
      });

      setUser(updatedUser);
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...updatedUser, token: updatedUser.token })
      );

      setIsEditingAddress(false);
    } catch (error) {
      console.error(error);
      setErrorMsg("Lỗi khi lưu địa chỉ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (isEditingAddress) {
      setErrorMsg("Vui lòng lưu địa chỉ trước khi đặt hàng");
      return;
    }

    if (!hasValidPhone) {
      setErrorMsg("Số điện thoại không hợp lệ. Vui lòng cập nhật trong hồ sơ.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingAddress: {
          province: addressForm.province,
          district: addressForm.district,
          ward: addressForm.ward,
          street: addressForm.street,
          country: addressForm.country,
          name: user.name,
          phone: user.phone,
        },
        paymentMethod: paymentMethod,
      };

      const createdOrder = await apiClient.post("/orders", orderData);
      await refetchCart();
      navigate(`/orders/${createdOrder._id}`);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container">Loading checkout...</div>;

  return (
    <div className="page checkout-page">
      <div className="container">
        <h2 className="section-title">Thanh toán</h2>

        <div className="checkout-grid">
          <div className="checkout-left">
            <section className="checkout-section">
              <div className="section-header">
                <h3>Địa chỉ giao hàng</h3>
                {!isEditingAddress && (
                  <button
                    className="btn-text"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    Thay đổi
                  </button>
                )}
              </div>

              {!isEditingAddress ? (
                <div className="address-summary-card">
                  <p className="user-name">{user.name}</p>
                  <p className="address-line">{addressForm.street}</p>
                  <p className="address-line">
                    {addressForm.ward}, {addressForm.district},{" "}
                    {addressForm.province}
                  </p>
                  <p className="address-country">{addressForm.country}</p>

                  {hasValidPhone ? (
                    <p className="user-phone">SĐT: {user.phone}</p>
                  ) : (
                    <p className="user-phone error-text">
                      SĐT chưa hợp lệ -{" "}
                      <Link to="/account/profile">Cập nhật ngay</Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="address-form-container">
                  {errorMsg && <div className="form-error">{errorMsg}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tỉnh / Thành phố</label>
                      <input
                        type="text"
                        name="province"
                        value={addressForm.province}
                        onChange={handleAddressChange}
                        placeholder="Vd: Hà Nội"
                      />
                    </div>
                    <div className="form-group">
                      <label>Quận / Huyện</label>
                      <input
                        type="text"
                        name="district"
                        value={addressForm.district}
                        onChange={handleAddressChange}
                        placeholder="Vd: Cầu Giấy"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phường / Xã</label>
                      <input
                        type="text"
                        name="ward"
                        value={addressForm.ward}
                        onChange={handleAddressChange}
                        placeholder="Vd: Dịch Vọng"
                      />
                    </div>
                    <div className="form-group">
                      <label>Số nhà, Tên đường</label>
                      <input
                        type="text"
                        name="street"
                        value={addressForm.street}
                        onChange={handleAddressChange}
                        placeholder="Vd: 123 Xuân Thủy"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn secondary"
                      onClick={() => setIsEditingAddress(false)}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn primary"
                      onClick={handleSaveAddress}
                      disabled={loading}
                    >
                      Lưu địa chỉ
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="checkout-section">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-options">
                <label
                  className={`payment-option ${
                    paymentMethod === "COD" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <span className="payment-title">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                    <span className="payment-desc">
                      Thanh toán tiền mặt cho shipper.
                    </span>
                  </div>
                </label>
                <label
                  className={`payment-option ${
                    paymentMethod === "BANKING" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="BANKING"
                    checked={paymentMethod === "BANKING"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-content">
                    <span className="payment-title">
                      Chuyển khoản ngân hàng
                    </span>
                    <span className="payment-desc">
                      Quét mã QR qua ứng dụng ngân hàng.
                    </span>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <div className="checkout-right">
            <div className="order-summary-box">
              <h3>Đơn hàng ({items.length} sản phẩm)</h3>
              <div className="summary-list">
                {items.map((item) => (
                  <div
                    key={item.book._id || item.book}
                    className="summary-item"
                  >
                    <div className="item-info">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">{item.title}</span>
                    </div>
                    <span className="item-price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>
                  {shippingPrice === 0
                    ? "Miễn phí"
                    : formatPrice(shippingPrice)}
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span className="total-amount">{formatPrice(totalPrice)}</span>
              </div>

              {errorMsg && !isEditingAddress && (
                <p className="checkout-error-text">{errorMsg}</p>
              )}

              <button
                className="btn checkout-btn"
                onClick={handlePlaceOrder}
                disabled={loading || isEditingAddress || !hasValidPhone}
                title={
                  !hasValidPhone ? "Cập nhật SĐT để mua hàng" : "Đặt hàng ngay"
                }
              >
                {loading ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              {!hasValidPhone && (
                <p className="phone-warning-text">
                  Vui lòng{" "}
                  <Link to="/account/profile">
                    cập nhật Số điện thoại hợp lệ
                  </Link>{" "}
                  để hoàn tất.
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
