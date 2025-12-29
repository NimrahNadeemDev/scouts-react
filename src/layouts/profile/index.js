import React, { useState, useEffect } from "react";

// MUI
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";

// Icons
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Axios and auth helpers
import axiosInstance from "config/axiosConfig";
import { useCustomer } from "hooks/useCustomer";

const Profile = () => {
  // Get customer ID using the custom hook
  const { customerId, user: currentUser, loading: authLoading } = useCustomer();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const SIDEBAR_WIDTH = 280;

  // Fetch user profile data whenever component mounts or customerId changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!customerId) return;

      try {
        setFetchingProfile(true);
        console.log("Fetching profile for customer ID:", customerId);

        // Try to fetch profile from API
        const response = await axiosInstance.get(`/customers/edit-profile/${customerId}`);
        console.log("Profile fetched:", response.data);

        const userData = response.data.user || response.data.customer || response.data;

        // Update form with fetched data
        setForm({
          name: userData.name || "",
          email: userData.email || "",
          password: "",
          confirmPassword: "",
        });

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.warn("Could not fetch profile from API, using cached data:", err);

        // Fallback to cached user data from localStorage
        if (currentUser) {
          setForm({
            name: currentUser.name || "",
            email: currentUser.email || "",
            password: "",
            confirmPassword: "",
          });
        }
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfile();
  }, [customerId]); // Re-fetch when customerId changes

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";

    if (form.password) {
      if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess("");

    if (!validate()) return;

    try {
      setLoading(true);

      // Prepare request body
      const requestBody = {
        name: form.name,
      };

      // Only include password fields if password is being updated
      if (form.password) {
        requestBody.password = form.password;
        requestBody.password_confirmation = form.confirmPassword;
      }

      // Make API call with axios instance (auth token added automatically by interceptor)
      const response = await axiosInstance.post(
        `/customers/update-profile/${customerId}`,
        requestBody
      );

      console.log("Profile updated:", response.data);

      // Update localStorage with new user data if returned
      const updatedUser = response.data.user || response.data.customer || response.data;
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update form with fresh data
        setForm({
          name: updatedUser.name || form.name,
          email: updatedUser.email || form.email,
          password: "",
          confirmPassword: "",
        });
      } else {
        // Clear password fields
        setForm({ ...form, password: "", confirmPassword: "" });
      }

      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);

      if (err.response) {
        setApiError(err.response.data?.message || "Failed to update profile");
      } else if (err.request) {
        setApiError("Unable to reach server. Please check your connection.");
      } else {
        setApiError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching initial data
  if (authLoading || fetchingProfile) {
    return (
      <Box
        sx={{
          ml: `${SIDEBAR_WIDTH}px`,
          p: 3,
          minHeight: "100vh",
          backgroundColor: "#e0f7fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ml: `${SIDEBAR_WIDTH}px`,
        p: 3,
        minHeight: "100vh",
        backgroundColor: "#e0f7fa",
      }}
    >
      <Card sx={{ maxWidth: 900, width: "100%", p: 4, borderRadius: 3 }}>
        {/* HEADER */}
        <Box textAlign="center" mb={3}>
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00c6a7, #1e88e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonOutlineIcon sx={{ color: "#fff", fontSize: 32 }} />
          </Box>

          <Typography variant="h5" fontWeight={700}>
            Update Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your information and verification documents
          </Typography>
        </Box>

        {/* API ERROR / SUCCESS */}
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError("")}>
            {apiError}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* FORM */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* NAME */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>

            {/* EMAIL */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address *"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled
              />
            </Grid>

            {/* PASSWORD */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* CONFIRM PASSWORD */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>

          {/* BUTTONS */}
          <Box mt={4} display="flex" gap={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => window.location.reload()}
              disabled={loading}
              sx={{
                color: "#00796b",
                borderColor: "#00796b",
                "&:hover": {
                  backgroundColor: "#b2dfdb",
                  borderColor: "#00796b",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                color: "#fff",
                fontWeight: 600,
                background: "linear-gradient(135deg,#00c6a7,#1e88e5)",
                "&:hover": {
                  background: "linear-gradient(135deg,#00b39d,#1565c0)",
                },
              }}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;
