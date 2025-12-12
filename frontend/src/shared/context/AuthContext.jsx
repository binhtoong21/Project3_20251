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

  const handleAuthSuccess = useCallback((authData) => {
    localStorage.setItem("userData", JSON.stringify({ token: authData.token }));
    const userData = {
      _id: authData.userId || authData._id,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    };
    setUser(userData);
    return userData;
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const storedData = JSON.parse(localStorage.getItem("userData"));
      if (storedData && storedData.token) {
        // apiClient handles the token automatically, no need for headers
        const profile = await apiClient.get("/users/profile");
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
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
    setLoading(false);
  }, []);

  const authValue = {
    user,
    setUser,
    login,
    logout,
    handleAuthSuccess, // Expose the new handler
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
