import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { isValidPhone, isValidAddress } from "../../shared/utils/validators";
import "./UserProfile.css";
import { FaPen, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import AddressSelector from "../../shared/components/AddressSelector";

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);

  // Unified Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: { 
        province: "", province_id: null,
        district: "", district_id: null, 
        ward: "", ward_code: null,
        street: ""
    },
    pickupAddress: { 
        province: "", province_id: null,
        district: "", district_id: null, 
        ward: "", ward_code: null,
        street: ""
    }
  });

  const [useSameAddress, setUseSameAddress] = useState(false);

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", msg: "" });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || {},
        pickupAddress: user.pickupAddress || {}
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFeedback({ type: "", msg: "" });
  };

  const saveProfile = async (dataToSave) => {
    setIsLoading(true);
    setFeedback({ type: "", msg: "" });
    try {
      // 1. Update Basic Profile
      const profileData = {
        name: dataToSave.name,
        phone: dataToSave.phone,
      };
      let updatedUser = await apiClient.put(`/users/profile`, profileData);

      // 2. Prepare Address Data (Both Shipping & Pickup)
      const payload = {
            address: dataToSave.address,
            pickupAddress: useSameAddress ? dataToSave.address : dataToSave.pickupAddress
      };
      
      // Send both addresses to backend (Backend should handle validation/saving)
      updatedUser = await apiClient.put("/users/profile/address", payload);

      setUser(updatedUser);
      setFeedback({ type: "success", msg: "Cập nhật thông tin thành công!" });
      setIsEditing(false);
      setShowOtpInput(false);
      setOtp("");
    } catch (error) {
      setFeedback({ type: "error", msg: "Lỗi: " + error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();

    // Validate Phone
    if (formData.phone && !isValidPhone(formData.phone)) {
      setFeedback({
        type: "error",
        msg: "Số điện thoại không đúng định dạng (VN).",
      });
      return;
    }

    // OTP Check if phone changed
    if (formData.phone !== user.phone && formData.phone !== "") {
      setTempPhone(formData.phone);
      setShowOtpInput(true);
      setFeedback({
        type: "info",
        msg: "Số điện thoại thay đổi. Cần xác thực OTP.",
      });
      return;
    }

    saveProfile(formData);
  };

  const handleVerifyOtp = () => {
    if (otp === "123456") {
      saveProfile({ ...formData, phone: tempPhone });
    } else {
      setFeedback({ type: "error", msg: "Mã OTP sai (Gợi ý: 123456)" });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        ward: user.address?.ward || "",
        district: user.address?.district || "",
        province: user.address?.province || "",
      });
    }
    setIsEditing(false);
    setShowOtpInput(false);
    setFeedback({ type: "", msg: "" });
  };

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || "User"
  )}&background=random&size=128`;

  const hasAddress = user?.address && isValidAddress(user.address);

  return (
    <div className="profile-container-new">
      <div className="profile-header-card">
        <div className="avatar-wrapper">
          <img
            src={defaultAvatarUrl}
            alt="Avatar"
            className="profile-avatar-img"
          />
        </div>
        <div className="user-identity">
          <h2 className="user-fullname">{user?.name}</h2>
          <p className="user-role">
            {user?.role === "admin" ? "Quản trị viên" : "Khách hàng"}
          </p>
        </div>
        {!isEditing && (
            <button
              className="btn-edit-toggle"
              onClick={() => setIsEditing(true)}
              style={{alignSelf: 'center', marginLeft: 'auto'}}
            >
              <FaPen style={{ marginRight: "8px" }} /> Chỉnh sửa
            </button>
        )}
      </div>

      <div className="profile-details-card">
        <div className="details-header">
          <h3>Thông tin tài khoản</h3>
        </div>

        {feedback.msg && (
          <div className={`feedback-alert ${feedback.type}`}>
            {feedback.type === "success" ? (
              <FaCheckCircle />
            ) : (
                feedback.type === "info" ?  <FaCheckCircle /> : <FaTimesCircle />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="profile-form">
            <div className="form-section">
                <h4><FaUser style={{marginRight: '8px', color: '#666'}}/> Thông tin cơ bản</h4>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Họ và tên</label>
                        {isEditing ? (
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        ) : (
                        <div className="info-display">{formData.name}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <div className="info-display disabled">{formData.email}</div>
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        {isEditing ? (
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ví dụ: 0987654321"
                        />
                        ) : (
                        <div className="info-display">
                            {formData.phone || <span className="text-warning">Chưa cập nhật</span>}
                        </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Section - Only show inputs when editing */}
            <div className="form-section">
                <div className="section-header-row">
                    <h4><FaMapMarkerAlt style={{marginRight: '8px', color: '#666'}}/> Địa chỉ giao hàng (Mặc định)</h4>
                </div>
                
                {!isEditing ? (
                     <div className="address-display-only">
                         {hasAddress ? (
                             <p>
                                 {user.address.street}, {user.address.ward}, {user.address.district}, {user.address.province}
                             </p>
                         ) : (
                             <p className="text-warning">Chưa có địa chỉ giao hàng.</p>
                         )}
                     </div>
                ) : (
                    <div className="address-selector-wrapper">
                        <AddressSelector 
                            value={formData.address}
                            onChange={(newAddress) => setFormData({...formData, address: newAddress})}
                        />
                    </div>
                )}
            </div>

            {/* Pickup Address Section - For Sellers or Potential Sellers */}
            <div className="form-section">
                <div className="section-header-row">
                    <h4><FaMapMarkerAlt style={{marginRight: '8px', color: '#666'}}/> Địa chỉ kho / Lấy hàng (Dành cho Người bán)</h4>
                </div>
                 {!isEditing ? (
                     <div className="address-display-only">
                         {user?.pickupAddress && isValidAddress(user.pickupAddress) ? (
                             <p>
                                 {user.pickupAddress.street}, {user.pickupAddress.ward}, {user.pickupAddress.district}, {user.pickupAddress.province}
                                 <br/>
                                 <small className="text-muted">(SĐT Kho: {user.pickupAddress.phone || user.phone})</small>
                             </p>
                         ) : (
                             <p className="text-muted" style={{fontStyle: 'italic'}}>Dùng chung địa chỉ giao hàng hoặc chưa cấu hình.</p>
                         )}
                     </div>
                ) : (
                    <div>
                         <div className="form-group" style={{marginBottom: '10px'}}>
                            <label style={{display:'flex', alignItems:'center', gap: '8px', cursor: 'pointer'}}>
                                <input 
                                    type="checkbox" 
                                    checked={useSameAddress} 
                                    onChange={(e) => {
                                        setUseSameAddress(e.target.checked);
                                        if (e.target.checked) setFormData({...formData, pickupAddress: {...formData.address}});
                                    }}
                                /> 
                                Sử dụng địa chỉ giao hàng làm địa chỉ kho
                            </label>
                        </div>

                        {!useSameAddress && (
                             <div className="address-selector-wrapper">
                                <AddressSelector 
                                    value={formData.pickupAddress}
                                    onChange={(newAddress) => setFormData({...formData, pickupAddress: newAddress})}
                                />
                             </div>
                        )}
                    </div>
                )}
            </div>

          {showOtpInput && (
            <div className="otp-verification-box">
              <p>
                OTP gửi về <strong>{tempPhone}</strong>
              </p>
              <div className="otp-input-group">
                <input
                  type="text"
                  placeholder="Nhập mã: 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-verify"
                  onClick={handleVerifyOtp}
                >
                  Xác thực
                </button>
              </div>
            </div>
          )}

          {isEditing && !showOtpInput && (
            <div className="form-actions-new">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
