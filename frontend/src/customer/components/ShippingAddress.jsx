import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { isValidAddress } from "../../shared/utils/validators";
import "./ShippingAddress.css";
import { FaPen, FaMapMarkerAlt } from "react-icons/fa";

const ShippingAddress = () => {
  const { user, setUser } = useContext(AuthContext);

  // State quản lý chế độ Xem/Sửa
  const [isEditing, setIsEditing] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    street: "",
    ward: "",
    district: "",
    province: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Kiểm tra user đã có địa chỉ hợp lệ chưa
  const hasAddress = user && user.address && isValidAddress(user.address);

  useEffect(() => {
    if (user && user.address) {
      setFormData({
        street: user.address.street || "",
        ward: user.address.ward || "",
        district: user.address.district || "",
        province: user.address.province || "",
      });

      // Nếu chưa có địa chỉ hợp lệ, tự động bật chế độ sửa để người dùng nhập
      if (!isValidAddress(user.address)) {
        setIsEditing(true);
      } else {
        setIsEditing(false);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate trước khi gửi
    if (!isValidAddress(formData)) {
      setErrorMsg("Vui lòng điền đầy đủ Tỉnh, Huyện, Xã và Đường.");
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await apiClient.put("/users/profile/address", {
        address: formData,
      });
      setUser(updatedUser); // Cập nhật Context
      setSuccessMsg("Đã lưu địa chỉ thành công!");
      setIsEditing(false); // Tắt chế độ sửa
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ", error);
      setErrorMsg("Cập nhật thất bại: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form về dữ liệu gốc
    if (user && user.address) {
      setFormData({
        street: user.address.street || "",
        ward: user.address.ward || "",
        district: user.address.district || "",
        province: user.address.province || "",
      });
    }
    setErrorMsg("");
    // Quay về chế độ xem (chỉ khi đã có địa chỉ cũ)
    if (hasAddress) {
      setIsEditing(false);
    }
  };

  return (
    <div className="address-panel">
      {/*  HEADER  */}
      <div className="panel-header">
        <div className="header-left">
          <h2>Địa chỉ giao hàng</h2>
          <p>Địa chỉ này sẽ được dùng mặc định khi thanh toán.</p>
        </div>
        {/* Nút Chỉnh sửa chỉ hiện khi đang ở chế độ Xem và đã có địa chỉ */}
        {!isEditing && hasAddress && (
          <button
            className="btn-edit-toggle"
            onClick={() => setIsEditing(true)}
          >
            <FaPen style={{ marginRight: "6px" }} /> Chỉnh sửa
          </button>
        )}
      </div>

      <div className="address-body">
        {/*  CHẾ ĐỘ XEM   */}
        {!isEditing && hasAddress ? (
          <div className="address-summary-view">
            <div className="summary-icon">
              <FaMapMarkerAlt />
            </div>
            <div className="summary-content">
              <div className="summary-row">
                <span className="label">Người nhận:</span>
                <span className="value strong">{user.name}</span>
              </div>
              <div className="summary-row">
                <span className="label">Số điện thoại:</span>
                <span className="value">{user.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row full-address">
                <span className="label">Địa chỉ:</span>
                <span className="value">
                  {user.address.street}, {user.address.ward},{" "}
                  {user.address.district}, {user.address.province}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">Quốc gia:</span>
                <span className="value">
                  {user.address.country || "Việt Nam"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /*  CHẾ ĐỘ SỬA   */
          <form onSubmit={handleSubmit} className="address-form-content">
            {errorMsg && <div className="form-message error">{errorMsg}</div>}
            {successMsg && (
              <div className="form-message success">{successMsg}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Tỉnh / Thành phố</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Vd: TP. Hồ Chí Minh"
                />
              </div>
              <div className="form-group">
                <label>Quận / Huyện</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Vd: Quận 1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phường / Xã</label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  placeholder="Vd: Phường Bến Nghé"
                />
              </div>
              <div className="form-group">
                <label>Số nhà, Tên đường</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Vd: 123 Nguyễn Huệ"
                />
              </div>
            </div>

            <div className="form-footer">
              {/* Chỉ hiện nút Hủy nếu User đã có địa chỉ cũ để quay về */}
              {hasAddress && (
                <button
                  type="button"
                  className="btn secondary"
                  onClick={handleCancel}
                >
                  Hủy bỏ
                </button>
              )}
              <button
                type="submit"
                className="btn primary"
                disabled={isLoading}
              >
                {isLoading ? "Đang lưu..." : "Lưu địa chỉ"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ShippingAddress;
