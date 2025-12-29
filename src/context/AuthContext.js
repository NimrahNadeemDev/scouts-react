import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  getAuthToken,
  getUser,
  clearAuthData,
  isAuthenticated as checkAuth,
} from "config/axiosConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const token = getAuthToken();
    const storedUser = getUser();

    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);

    // Optionally store in localStorage if not already done
    if (token) {
      localStorage.setItem("authToken", token);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    clearAuthData(); // Clear all auth data
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user data (useful for profile updates)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser, // Added updateUser function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};
