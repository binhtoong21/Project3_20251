import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import { isValidPhone } from "../../shared/utils/validators";
import "./UserProfile.css";
import { FaPen, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

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
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFeedback({ type: "", msg: "" });
  };

  const saveProfile = async (dataToSave) => {
    setIsLoading(true);
    try {
      const updatedUser = await apiClient.put(`/users/profile`, dataToSave);
      setUser(updatedUser);
      setFeedback({ type: "success", msg: "Cập nhật thành công!" });
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

    // Kiểm tra định dạng số điện thoại
    if (!isValidPhone(formData.phone)) {
      setFeedback({
        type: "error",
        msg: "Số điện thoại không đúng định dạng (VN).",
      });
      return;
    }

    if (formData.phone !== user.phone) {
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
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setIsEditing(false);
    setShowOtpInput(false);
    setFeedback({ type: "", msg: "" });
  };

  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || "User"
  )}&background=random&size=128`;

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
      </div>

      <div className="profile-details-card">
        <div className="details-header">
          <h3>Thông tin cá nhân</h3>
          {!isEditing && (
            <button
              className="btn-edit-toggle"
              onClick={() => setIsEditing(true)}
            >
              <FaPen style={{ marginRight: "8px" }} /> Chỉnh sửa
            </button>
          )}
        </div>

        {feedback.msg && (
          <div className={`feedback-alert ${feedback.type}`}>
            {feedback.type === "success" ? (
              <FaCheckCircle />
            ) : (
              <FaTimesCircle />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        <form onSubmit={handlePreSubmit} className="profile-form">
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
            <label>
              Số điện thoại {isEditing && <span className="required">*</span>}
            </label>
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
                {formData.phone ? (
                  formData.phone
                ) : (
                  <span className="text-warning">Chưa có số điện thoại</span>
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
