
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidAddress, isValidPhone } from "../utils/validators";

export const useProfileCheck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkProfile = (onSuccess, redirectPath = '/account/profile') => {
    if (!user) {
      if (window.confirm("Bạn cần đăng nhập để thực hiện hành động này.")) {
         navigate('/login');
      }
      return;
    }

    const hasPhone = user.phone && isValidPhone(user.phone);
    const hasAddress = user.address && isValidAddress(user.address);

    if (!hasPhone || !hasAddress) {
      if (window.confirm("Bạn cần cập nhật Số điện thoại và Địa chỉ để thực hiện hành động này. Đi đến trang cá nhân ngay?")) {
        navigate(redirectPath, { state: { from: window.location.pathname } });
      }
      return;
    }

    // If all good, execute the callback
    if (onSuccess) {
      onSuccess();
    }
  };

  return checkProfile;
};
