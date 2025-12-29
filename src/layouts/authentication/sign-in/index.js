import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Image
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

// Axios and auth helpers
import axiosInstance, { getCustomerId, getAuthToken } from "config/axiosConfig";

// Helper function to decode JWT and extract customer ID
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

function Basic() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI states
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error message shown at top
  const [error, setError] = useState("");

  // Toggle remember me
  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  // Redirect if already logged in - Only check once on mount
  useEffect(() => {
    const token = getAuthToken();
    const customerId = getCustomerId();

    if (token && customerId) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, []);

  const handleSignIn = async () => {
    setError(""); // clear old errors

    // Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Make API call with Axios
      const response = await axiosInstance.post("/customers/login", {
        email,
        password,
      });

      console.log("Login API response:", response.data);

      const { access_token } = response.data;

      // Validate response data
      if (!access_token) {
        setError("No authentication token received. Please contact support.");
        setLoading(false);
        return;
      }

      // Decode JWT to extract customer ID and other info
      const decodedToken = decodeJWT(access_token);
      console.log("Decoded JWT:", decodedToken);

      if (!decodedToken) {
        setError("Invalid token received. Please contact support.");
        setLoading(false);
        return;
      }

      // Extract customer ID from token (it's in the "sub" field)
      const customerId = decodedToken.sub;

      if (!customerId) {
        setError("Customer ID not found in token. Please contact support.");
        setLoading(false);
        return;
      }

      // Store the token
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("customerId", customerId.toString());

      console.log("Token stored, now fetching user profile...");

      // Fetch full user profile using the customer ID
      try {
        const profileResponse = await axiosInstance.get(`/customers/update-profile/${customerId}`);
        console.log("Profile API response:", profileResponse.data);

        const userData =
          profileResponse.data.user || profileResponse.data.customer || profileResponse.data;

        if (userData) {
          // Store user data
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: customerId,
              email: email,
              ...userData,
            })
          );
          console.log("User data stored:", userData);
        } else {
          // If profile fetch fails, store minimal user data
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: customerId,
              email: email,
              role: decodedToken.role || "Customer",
            })
          );
          console.log("Stored minimal user data from token");
        }
      } catch (profileErr) {
        console.warn("Could not fetch full profile, using token data:", profileErr);

        // Store minimal user data from token
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: customerId,
            email: email,
            role: decodedToken.role || "Customer",
          })
        );
      }

      console.log("Login successful! Customer ID:", customerId);

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      console.error("Login error:", err);

      // Better error handling
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.message || "Invalid credentials";
        setError(errorMessage);
      } else if (err.request) {
        // Request made but no response
        setError("Unable to reach server. Please check your internet connection.");
      } else {
        // Other errors
        setError(err.message || "Login failed. Please try again.");
      }

      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        {/* Header */}
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox
            component="form"
            role="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
          >
            {/* API / Validation Error Message (TOP) */}
            {error && (
              <MDBox mb={2} p={2} bgcolor="error.light" borderRadius="md">
                <MDTypography variant="caption" color="error" fontWeight="medium">
                  {error}
                </MDTypography>
              </MDBox>
            )}

            {/* Email */}
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </MDBox>

            {/* Password */}
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </MDBox>

            {/* Remember me */}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} disabled={loading} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>
            </MDBox>

            {/* Sign in button */}
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </MDButton>
            </MDBox>

            {/* Sign up link */}
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
