import React, { createContext, useContext, useState } from "react";
import PropTypes from "prop-types";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Changed function name from showSnackbar to openSnackBar to match usage
  const openSnackBar = (severity = "success", message) => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ snackbar, openSnackBar, closeSnackbar }}>
      {children}
    </SnackbarContext.Provider>
  );
};

SnackbarProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useSnackbarContext = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbarContext must be used within SnackbarProvider");
  }
  return context;
};
