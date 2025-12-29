import React from "react";
import { Button, CircularProgress } from "@mui/material";

const CustomButton = ({
  type = "button",
  variant = "contained",
  size = "large",
  fullWidth = false,
  disabled = false,
  loading = false,
  color = "primary", // New prop for color variants
  children,
  onClick,
  ...props
}) => {
  // Define color variants with actual color values
  const colorStyles = {
    primary: {
      backgroundColor: "var(--button-color, #7352C7)", // fallback to blue-600
      "&:hover": { backgroundColor: "var(--button-hover, #573d99)" },
    },
    secondary: {
      backgroundColor: "#4b5563",
      "&:hover": { backgroundColor: "#374151" },
    },
    success: {
      backgroundColor: "#16a34a",
      "&:hover": { backgroundColor: "#15803d" },
    },
    danger: {
      backgroundColor: "#dc2626",
      "&:hover": { backgroundColor: "#b91c1c" },
    },
    warning: {
      backgroundColor: "#eab308",
      "&:hover": { backgroundColor: "#ca8a04" },
    },
    info: {
      backgroundColor: "#0891b2",
      "&:hover": { backgroundColor: "#0e7490" },
    },
    dark: {
      backgroundColor: "#111827",
      "&:hover": { backgroundColor: "#1f2937" },
    },
    light: {
      backgroundColor: "#e5e7eb",
      color: "#1f2937",
      "&:hover": { backgroundColor: "#d1d5db" },
    },
  };

  // Get the appropriate color style
  const buttonColorStyle = colorStyles[color] || colorStyles.primary;

  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      disableElevation
      className="py-3 rounded-lg font-semibold text-xs transition-colors duration-200 text-nowrap overflow-ellipsis"
      sx={{
        ...buttonColorStyle,
        textTransform: "none",
        color: color === "light" ? "#1f2937" : "#fff",
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <CircularProgress
            size={20}
            className="mr-2"
            sx={{ color: color === "light" ? "#1f2937" : "#fff" }}
          />
          Loading...
        </div>
      ) : (
        children
      )}
    </Button>
  );
};

export default CustomButton;
