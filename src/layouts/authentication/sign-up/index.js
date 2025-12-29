import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Image
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

// Axios and auth helpers
import axiosInstance, { setAuthData } from "config/axiosConfig";

function Cover() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    web_url: "",
  });

  const [errors, setErrors] = useState({});
  const [apiMessage, setApiMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // Local validation
  const validateFields = () => {
    const newErrors = {};
    const requiredFields = [
      "name",
      "email",
      "password",
      "password_confirmation",
      "phone",
      "address",
      "city",
      "state",
      "postal_code",
    ];

    requiredFields.forEach((field) => {
      if (!form[field]) newErrors[field] = "This field is required";
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) newErrors.email = "Invalid email address";

    // Phone validation
    const phoneRegex = /^\d{10,}$/;
    if (form.phone && !phoneRegex.test(form.phone))
      newErrors.phone = "Phone must be at least 10 digits";

    // Password confirmation
    if (
      form.password &&
      form.password_confirmation &&
      form.password !== form.password_confirmation
    ) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    // Terms checkbox
    if (!agree) newErrors.agree = "You must agree to the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sign-Up handler
  const handleSignUp = async () => {
    setApiMessage("");
    setMessageType("");

    if (!validateFields()) return;

    try {
      setLoading(true);

      // Make API call with Axios
      const response = await axiosInstance.post("/customers/store-register", form);

      console.log("Registration response:", response.data);

      // Check if registration was successful and customer ID is returned
      const { user, access_token } = response.data;

      if (!user) {
        setApiMessage("Registration successful but user data not returned. Please sign in.");
        setMessageType("success");
        setTimeout(() => navigate("/authentication/sign-in"), 2500);
        return;
      }

      // Extract customer ID - handle different possible field names
      const customerId = user.id || user.customer_id || user.customerId;

      if (!customerId) {
        console.error("Customer ID not found in registration response:", user);
        setApiMessage(
          "Registration successful but customer ID not assigned. Please contact support."
        );
        setMessageType("error");
        setLoading(false);
        return;
      }

      console.log("Registration successful! Customer ID assigned:", customerId);

      // Option 1: If backend returns access_token on registration, store auth data and redirect to dashboard
      if (access_token) {
        setAuthData(access_token, user);
        setApiMessage(
          `Registration successful! Your Customer ID is ${customerId}. Redirecting to dashboard...`
        );
        setMessageType("success");
        setTimeout(() => navigate("/dashboard"), 2500);
      }
      // Option 2: If no token returned, just store customer ID and redirect to sign in
      else {
        localStorage.setItem("customerId", customerId.toString());
        setApiMessage(
          `Registration successful! Your Customer ID is ${customerId}. Redirecting to Sign-In...`
        );
        setMessageType("success");
        setTimeout(() => navigate("/authentication/sign-in"), 2500);
      }
    } catch (err) {
      console.error("Registration error:", err);

      // Better error handling
      if (err.response) {
        const errorMessage = err.response.data?.message || "Registration failed";
        setApiMessage(errorMessage);
      } else if (err.request) {
        setApiMessage("Unable to reach server. Please check your internet connection.");
      } else {
        setApiMessage(err.message || "Registration failed. Please try again.");
      }

      setMessageType("error");
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Name *" },
    { name: "email", label: "Email *", type: "email" },
    { name: "password", label: "Password *", type: "password" },
    { name: "password_confirmation", label: "Confirm Password *", type: "password" },
    { name: "phone", label: "Phone *" },
    { name: "address", label: "Address *" },
    { name: "city", label: "City *" },
    { name: "state", label: "State *" },
    { name: "postal_code", label: "Postal Code *" },
    { name: "web_url", label: "Website URL" },
  ];

  return (
    <BasicLayout
      image={bgImage}
      showFooter={false}
      sx={{ overflowY: "auto", minHeight: "100vh", py: 6 }}
    >
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your details to register
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox
            component="form"
            role="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            {fields.map((field) => (
              <MDBox mb={2} key={field.name}>
                <MDInput
                  name={field.name}
                  type={field.type || "text"}
                  label={field.label}
                  variant="standard"
                  fullWidth
                  value={form[field.name]}
                  onChange={handleChange}
                  disabled={loading}
                />
                {errors[field.name] && (
                  <MDTypography variant="caption" color="error">
                    {errors[field.name]}
                  </MDTypography>
                )}
              </MDBox>
            ))}

            {/* Terms */}
            <MDBox display="flex" alignItems="center" ml={-1} mb={2}>
              <Checkbox checked={agree} onChange={() => setAgree(!agree)} disabled={loading} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </MDTypography>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            {errors.agree && (
              <MDTypography variant="caption" color="error" mb={2}>
                {errors.agree}
              </MDTypography>
            )}

            {/* API message */}
            {apiMessage && (
              <MDBox
                mb={2}
                p={2}
                bgcolor={messageType === "success" ? "success.light" : "error.light"}
                borderRadius="md"
              >
                <MDTypography
                  variant="caption"
                  color={messageType === "success" ? "success" : "error"}
                  fontWeight="medium"
                >
                  {apiMessage}
                </MDTypography>
              </MDBox>
            )}

            <MDBox mt={2}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth disabled={loading}>
                {loading ? "Creating account..." : "Sign up"}
              </MDButton>
            </MDBox>

            {/* Sign In Link */}
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Cover;
