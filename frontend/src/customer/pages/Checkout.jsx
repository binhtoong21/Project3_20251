import AddressSelector from "../../shared/components/AddressSelector"; // Import
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useCartState, useCartActions } from "../../shared/context/CartContext";
import { useAuth } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency } from "../../shared/utils/formatters";
import { isValidAddress, isValidPhone } from "../../shared/utils/validators";
import "./Checkout.css";

const Checkout = () => {
  const { items, subtotal } = useCartState();
  const { refetchCart } = useCartActions();
  const { user, setUser, refetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect Direct Purchase Mode
  const directPurchaseItem = location.state?.directPurchaseItem;
  
  // Decide which items to use
  const checkoutItems = directPurchaseItem ? [directPurchaseItem] : items;
  
  // Calculate Subtotal
  const currentSubtotal = directPurchaseItem 
    ? directPurchaseItem.price * directPurchaseItem.quantity
    : subtotal;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [calculatedShippingFee, setCalculatedShippingFee] = useState(0); // State for dynamic fee

  const hasValidPhone = user && user.phone && isValidPhone(user.phone);

  const [addressForm, setAddressForm] = useState({
    street: "",
    ward: "", ward_code: null,
    district: "", district_id: null,
    province: "", province_id: null,
    country: "Việt Nam",
  });

  // Calculate Weights (Approximate)
  const totalWeight = useMemo(() => {
     return checkoutItems.reduce((acc, item) => acc + (item.quantity * 200), 0);
  }, [checkoutItems]);

  const fetchShippingFee = useCallback(async (addr) => {
      if (!addr?.district_id || !addr?.ward_code) {
          setCalculatedShippingFee(0); // Default or invalid
          return;
      }
      try {
          const res = await apiClient.post("/location/calculate-fee", {
              to_district_id: addr.district_id,
              to_ward_code: addr.ward_code,
              weight: totalWeight,
              insurance_value: currentSubtotal
          });
          if (res && res.total) {
              setCalculatedShippingFee(res.total);
          }
      } catch (err) {
          console.error("Fee Calc Error", err);
          // Fallback static fee if API fails
           setCalculatedShippingFee(currentSubtotal > 100000 ? 0 : 30000);
      }
  }, [totalWeight, currentSubtotal]);

  // Update Fee when addressForm changes (and is valid)
  useEffect(() => {
      if (!isEditingAddress && addressForm.district_id && addressForm.ward_code) {
          fetchShippingFee(addressForm);
      }
  }, [isEditingAddress, addressForm, fetchShippingFee]);


  const transactionFee = 0;

  const totalPrice = useMemo(
    () => currentSubtotal + calculatedShippingFee + transactionFee,
    [currentSubtotal, calculatedShippingFee, transactionFee]
  );

  // Fetch user data on mount to get latest wallet balance
  useEffect(() => {
    if (refetchUser) {
      refetchUser();
    }
  }, [refetchUser]);

  // Handle navigation and address state changes
  useEffect(() => {
    // Wait until user object is loaded
    if (!user) {
      return;
    }
    
    if (items.length === 0 && !directPurchaseItem) {
      navigate("/cart");
      return;
    }

    if (user.address && isValidAddress(user.address)) {
      setAddressForm({
        street: user.address.street || "",
        ward: user.address.ward || "",
        ward_code: user.address.ward_code,
        district: user.address.district || "",
        district_id: user.address.district_id,
        province: user.address.province || "",
        province_id: user.address.province_id,
        country: user.address.country || "Việt Nam",
      });
      setIsEditingAddress(false);
      // Trigger fee calc immediately if we have data
      if(user.address.district_id && user.address.ward_code) {
          // This will be handled by the effect on addressForm
      }
    } else {
      setIsEditingAddress(true);
    }
  }, [user, items, navigate, directPurchaseItem]);

  // Removed handleAddressChange as AddressSelector handles it via object replacement

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
      // Fee will be recalculated by effect
    } catch (error) {
      console.error(error);
      setErrorMsg("Lỗi khi lưu địa chỉ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setErrorMsg("");
    if (isEditingAddress) {
      setErrorMsg("Vui lòng lưu địa chỉ trước khi đặt hàng");
      return;
    }

    if (!hasValidPhone) {
      setErrorMsg("Số điện thoại không hợp lệ. Vui lòng cập nhật trong hồ sơ.");
      return;
    }

    if (paymentMethod === 'wallet' && user.walletBalance < totalPrice) {
        setErrorMsg("Số dư ví không đủ. Vui lòng nạp thêm hoặc chọn phương thức khác.");
        return;
    }


    setLoading(true);
    try {
      const orderData = {
        shippingAddress: {
          province: addressForm.province,
          province_id: addressForm.province_id,
          district: addressForm.district,
          district_id: addressForm.district_id,
          ward: addressForm.ward,
          ward_code: addressForm.ward_code,
          street: addressForm.street,
          name: user.name, 
          phone: user.phone, 
        },
        paymentMethod: paymentMethod,
        shippingPrice: calculatedShippingFee, // Send the calc fee
      };

      // If direct purchase, include orderItems
      if (directPurchaseItem) {
        orderData.orderItems = [directPurchaseItem];
      }

      const createdOrder = await apiClient.post("/orders", orderData);
      await refetchCart();
      if(refetchUser) await refetchUser(); // update wallet balance after order
      toast.success("Đặt hàng thành công!");
      navigate(`/orders/${createdOrder._id}`);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || "Đặt hàng thất bại"; // Better error parsing
      setErrorMsg(msg);
      toast.error(msg);
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
                  <p className="address-country">Việt Nam</p>

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

                  <div className="address-selector-wrapper">
                      <AddressSelector 
                        value={addressForm} 
                        onChange={(newAddress) => setAddressForm(newAddress)} 
                      />
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn secondary"
                      onClick={() => {
                          // Reset to user's saved address on cancel
                           if (user.address && isValidAddress(user.address)) {
                                setAddressForm(user.address);
                           }
                           setIsEditingAddress(false);
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn primary"
                      onClick={handleSaveAddress}
                      disabled={loading}
                    >
                      Lưu và Tính phí ship
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
                    paymentMethod === "wallet" ? "selected" : ""
                  } ${user.walletBalance < totalPrice ? "disabled" : ""}`}
                  title={user.walletBalance < totalPrice ? "Số dư không đủ" : ""}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={user.walletBalance < totalPrice}
                  />
                  <div className="payment-content">
                    <span className="payment-title">
                      Thanh toán bằng Ví
                    </span>
                    <span className="payment-desc">
                      Số dư: {formatCurrency(user.walletBalance)}
                    </span>
                     {user.walletBalance < totalPrice && <span className="wallet-error">Không đủ số dư</span>}
                  </div>
                </label>
              </div>
              
              {/* COD Disclaimer */}
              {paymentMethod === "COD" && (
                <div style={{
                  marginTop: '15px', 
                  padding: '12px', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '8px', 
                  border: '1px solid #F59E0B',
                  fontSize: '0.9rem'
                }}>
                  <p style={{margin: 0, fontWeight: '600', color: '#92400E'}}>
                    ⚠️ Lưu ý về thanh toán COD
                  </p>
                  <p style={{margin: '8px 0 0 0', color: '#78350F', lineHeight: '1.5'}}>
                    Tiền thanh toán COD sẽ do đơn vị vận chuyển (GHN) thu hộ và chuyển trực tiếp cho người bán. 
                    Trong trường hợp cần hoàn tiền, vui lòng liên hệ trực tiếp với cửa hàng/người bán để được hỗ trợ.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="checkout-right">
            <div className="order-summary-box">
              <h3>Đơn hàng ({checkoutItems.length} sản phẩm)</h3>
              <div className="summary-list">
                {checkoutItems.map((item) => (
                  <div
                    key={item.book._id || item.book}
                    className="summary-item"
                  >
                    <div className="item-info">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">{item.title}</span>
                    </div>
                    <span className="item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Tạm tính</span>
                <span>{formatCurrency(currentSubtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển</span>
                <span>
                  {calculatedShippingFee === 0
                    ? "Miễn phí"
                    : formatCurrency(calculatedShippingFee)}
                </span>
              </div>



              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Tổng cộng</span>
                <span className="total-amount">{formatCurrency(totalPrice)}</span>
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

