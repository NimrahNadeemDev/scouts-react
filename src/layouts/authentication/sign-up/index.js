import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Layout
import BasicLayout from "layouts/authentication/components/BasicLayout";

// API
import { registerUser } from "services/authService";

// Image
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async () => {
    if (!agree) {
      setError("You must agree to the terms and conditions");
      return;
    }

    if (!form.email || !form.password || !form.name) {
      setError("Name, email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await registerUser({
        ...form,
        password_confirmation: form.password,
      });

      navigate("/authentication/sign-in");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicLayout image={bgImage} showFooter={false}>
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
            {/* Name */}
            <MDBox mb={2}>
              <MDInput
                name="name"
                label="Name"
                variant="standard"
                fullWidth
                value={form.name}
                onChange={handleChange}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                name="email"
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                value={form.email}
                onChange={handleChange}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                name="password"
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                value={form.password}
                onChange={handleChange}
              />
            </MDBox>

            {error && (
              <MDBox mb={2}>
                <MDTypography variant="caption" color="error">
                  {error}
                </MDTypography>
              </MDBox>
            )}

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox checked={agree} onChange={() => setAgree(!agree)} />
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

            <MDBox mt={4} mb={1}>
              <MDButton
                type="submit"
                variant="gradient"
                color="info"
                fullWidth
                onClick={handleSignUp}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Sign up"}
              </MDButton>
            </MDBox>

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
