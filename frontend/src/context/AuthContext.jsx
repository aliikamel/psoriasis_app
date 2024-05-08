// AuthContext.js
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Immediately check local storage to set initial auth state
    const token = localStorage.getItem("accessToken");
    return !!token;
  });

  const [role, setRole] = useState(
    () => localStorage.getItem("userRole") || ""
  );

  const login = (data) => {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("userRole", data.role);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("firstName", data.first_name);
    localStorage.setItem("lastName", data.last_name);
    localStorage.setItem("email", data.email);
    localStorage.setItem("password", data.password);
    localStorage.setItem("username", data.username);
    
    setIsAuthenticated(true);
    setRole(data.role);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setRole("");
    // Redirect to login page or update the state to reflect the logout
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
