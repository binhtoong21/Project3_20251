import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import apiClient from "../utils/apiClient";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //  HÀM XỬ LÝ KHI ĐĂNG NHẬP/ĐĂNG KÝ THÀNH CÔNG
  const handleAuthSuccess = useCallback((authData) => {
    //  Lưu token vào LocalStorage
    localStorage.setItem("userData", JSON.stringify({ token: authData.token }));

    //  Cấu trúc lại dữ liệu user để lưu vào State
    // QUAN TRỌNG: Phải map đầy đủ các trường từ Backend trả về
    const userData = {
      _id: authData.userId || authData._id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
      phone: authData.phone || "",
      avatar: authData.avatar || "",
      address: authData.address || {},
    };

    setUser(userData);
    return userData;
  }, []);

  //  HÀM LẤY PROFILE KHI F5 (RELOAD TRANG)
  const fetchUserProfile = useCallback(async () => {
    try {
      const storedData = JSON.parse(localStorage.getItem("userData"));

      if (storedData && storedData.token) {
        // Gọi API lấy thông tin mới nhất từ Server
        const profile = await apiClient.get("/users/profile");
        // API getProfile trả về full info
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      // Nếu token hết hạn hoặc lỗi, xóa storage
      localStorage.removeItem("userData");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    try {
      const data = await apiClient.post("/users/login", { email, password });
      return handleAuthSuccess(data);
    } catch (err) {
      localStorage.removeItem("userData");
      setUser(null);
      throw err;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("userData");
    setUser(null);
  }, []);

  const authValue = {
    user,
    setUser,
    login,
    logout,
    handleAuthSuccess,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
