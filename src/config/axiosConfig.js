import axios from "axios";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: "https://apis.thescouts.com.au/api/third-party",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Increased to 30 seconds for job posting
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("Making request to:", config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.status);
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      console.error("API Error Response:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Handle 401 Unauthorized
      if (
        error.response.status === 401 &&
        !window.location.pathname.includes("/authentication/sign-in")
      ) {
        console.log("Unauthorized - clearing auth and redirecting");
        clearAuthData();
        window.location.href = "/authentication/sign-in";
      }

      return Promise.reject(error);
    } else if (error.request) {
      // Request made but no response (timeout or network error)
      console.error("No response from server:", {
        readyState: error.request.readyState,
        status: error.request.status,
        timeout: error.code === "ECONNABORTED",
      });

      const errorMessage =
        error.code === "ECONNABORTED"
          ? "Request timed out. Please check your connection and try again."
          : "No response from server. Please check your connection.";

      return Promise.reject(new Error(errorMessage));
    } else {
      // Something else happened
      console.error("Request setup error:", error.message);
      return Promise.reject(new Error(error.message || "An unexpected error occurred"));
    }
  }
);

// Helper function to retry failed requests
export const retryRequest = async (requestFn, maxRetries = 2, delay = 1000) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries) throw error;

      console.log(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
};

// Helper functions for auth data management
export const setAuthData = (token, user) => {
  console.log("Setting auth data:", { token: token ? "present" : "missing", user });

  if (token) {
    localStorage.setItem("authToken", token);
  }

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));

    // Store customer ID - handle different possible field names from API
    const customerId = user.id || user.customer_id || user.customerId;
    if (customerId) {
      localStorage.setItem("customerId", customerId.toString());
      console.log("Customer ID stored:", customerId);
    } else {
      console.warn("No customer ID found in user object:", user);
    }
  }
};

export const getAuthToken = () => localStorage.getItem("authToken");

export const getCustomerId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.customer_id || user?.customerId || user?.id || null;
  } catch {
    return null;
  }
};

export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUser();
  return !!(token && user?.id);
};

export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("customerId");
  console.log("Auth data cleared");
};

// Wrapper function for posting jobs with retry logic
export const postJobWithRetry = async (payload) => {
  return retryRequest(
    () => axiosInstance.post("/post-job", payload),
    2, // max 2 retries
    2000 // 2 second initial delay
  );
};

export default axiosInstance;
