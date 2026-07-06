import { createContext, useContext, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("resumematch-user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persistSession = (token, user) => {
    localStorage.setItem("resumematch-token", token);
    localStorage.setItem("resumematch-user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.login(email, password);
      persistSession(token, user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await authApi.signup(name, email, password);
      persistSession(token, user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("resumematch-token");
    localStorage.removeItem("resumematch-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}