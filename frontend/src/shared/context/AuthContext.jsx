import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import PropTypes from 'prop-types';
import { apiPost } from "../utils/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to parse userInfo from localStorage", error);
      localStorage.removeItem("userInfo");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = useCallback((data) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    setUserInfo(data);
  }, []);

  const login = useCallback(
    async (email, password) => {
      try {
        const data = await apiPost("/users/login", { email, password });
        handleAuthSuccess(data);
        return data;
      } catch (err) {
        localStorage.removeItem("userInfo");
        setUserInfo(null);
        throw err;
      }
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  }, []);

  const authValue = {
    userInfo,
    login,
    logout,
    handleAuthSuccess,
    isAuthenticated: !!userInfo,
    loading,
  };

  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}