const API_BASE_URL = "https://apis.thescouts.com.au/api/third-party";

/* ============================
   Helpers
============================ */

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
};

const getHeaders = () => ({
  "Content-Type": "application/json",
});

/* ============================
   Auth APIs
============================ */

/**
 * Login user
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);

    // Save token and user in localStorage
    if (data.token) localStorage.setItem("authToken", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Register user
 * @param {object} payload
 */
export const registerUser = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/store-register`, {
      method: "POST", // Must be POST
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/* ============================
   Auth Helpers
============================ */

export const getAuthToken = () => localStorage.getItem("authToken");

export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
export const isAuthenticated = () => !!localStorage.getItem("authToken");

export const logoutUser = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};
