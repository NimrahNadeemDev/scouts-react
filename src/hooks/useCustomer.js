import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerId, getUser, isAuthenticated, clearAuthData } from "config/axiosConfig";

export const useCustomer = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to sign-in");
      navigate("/authentication/sign-in");
      return;
    }

    const id = getCustomerId();
    const userData = getUser();

    if (!id) {
      console.error("Customer ID not found, clearing auth and redirecting");
      clearAuthData();
      navigate("/authentication/sign-in");
      return;
    }

    setCustomerId(id);
    setUser(userData);
    setLoading(false);

    console.log("Customer loaded:", { customerId: id, user: userData });
  }, [navigate]);

  const logout = () => {
    clearAuthData();
    navigate("/authentication/sign-in");
  };

  return {
    customerId,
    user,
    loading,
    logout,
    isAuthenticated: isAuthenticated(),
  };
};

export default useCustomer;
