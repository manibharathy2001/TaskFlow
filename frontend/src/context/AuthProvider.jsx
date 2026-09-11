import { useEffect, useState } from "react";
import api from "../services/api";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/users/me");

        setUser(response.data.data.user);
      } catch (error) {
        console.error("Failed to load current user:", error);

        const status = error.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    token,
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;