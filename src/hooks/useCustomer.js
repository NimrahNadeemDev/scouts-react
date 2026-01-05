import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerId, getUser, isAuthenticated, clearAuthData } from "config/axiosConfig";

export const useCustomer = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❌ Not logged in → redirect
    if (!isAuthenticated()) {
      console.log("User not authenticated, redirecting to sign-in");
      navigate("/authentication/sign-in", { replace: true });
      return;
    }

    // ✅ Read from localStorage (login response)
    const storedUser = getUser();
    const id = storedUser?.id ?? getCustomerId();

    if (!id || !storedUser) {
      console.error("Invalid auth data, clearing storage");
      clearAuthData();
      navigate("/authentication/sign-in", { replace: true });
      return;
    }

    setCustomerId(id);
    setUser(storedUser);
    setLoading(false);

    console.log("Customer loaded:", { customerId: id, user: storedUser });
  }, [navigate]);

  const logout = () => {
    clearAuthData();
    navigate("/authentication/sign-in", { replace: true });
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
