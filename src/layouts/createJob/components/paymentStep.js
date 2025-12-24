import React from "react";
import PropTypes from "prop-types";
import { Grid, Card, CardContent } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function PaymentStep({ values, errors, touched, handleChange, handleBlur }) {
  const totalAmount = (values.salary || 0) * (values.numberOfGuards || 1);

  return (
    <MDBox>
      <MDTypography variant="h6" fontWeight="bold" mb={3} color="dark">
        Payment Information
      </MDTypography>

      {/* Summary Card */}
      <Card sx={{ mb: 3, backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Hourly Rate:
              </MDTypography>
              <MDTypography variant="h6" fontWeight="bold" color="dark">
                ${values.salary || 0}
              </MDTypography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Number of Guards:
              </MDTypography>
              <MDTypography variant="h6" fontWeight="bold" color="dark">
                {values.numberOfGuards || 1}
              </MDTypography>
            </Grid>
            <Grid item xs={12}>
              <MDBox sx={{ borderTop: "2px solid #dee2e6", pt: 2 }}>
                <MDTypography variant="body2" color="text" opacity={0.7} mb={0.5}>
                  Total Amount:
                </MDTypography>
                <MDTypography variant="h4" fontWeight="bold" color="success">
                  ${totalAmount}
                </MDTypography>
              </MDBox>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Grid container spacing={2}>
        {/* Card Holder Name */}
        <Grid item xs={12}>
          <MDInput
            type="text"
            label="Cardholder Name"
            fullWidth
            name="cardHolderName"
            value={values.cardHolderName || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.cardHolderName && Boolean(errors.cardHolderName)}
            helperText={touched.cardHolderName && errors.cardHolderName}
          />
        </Grid>

        {/* Card Number */}
        <Grid item xs={12}>
          <MDInput
            type="text"
            label="Card Number"
            fullWidth
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={values.cardNumber || ""}
            onChange={(e) => {
              // Format card number with spaces
              let value = e.target.value.replace(/\s/g, "");
              let formattedValue = value.replace(/(\d{4})/g, "$1 ").trim();
              handleChange({
                target: { name: "cardNumber", value: formattedValue },
              });
            }}
            onBlur={handleBlur}
            error={touched.cardNumber && Boolean(errors.cardNumber)}
            helperText={touched.cardNumber && errors.cardNumber}
          />
        </Grid>

        {/* Expiry Date */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="text"
            label="Expiry Date"
            fullWidth
            name="expiryDate"
            placeholder="MM/YY"
            value={values.expiryDate || ""}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value.length >= 2) {
                value = value.substring(0, 2) + "/" + value.substring(2, 4);
              }
              handleChange({
                target: { name: "expiryDate", value },
              });
            }}
            onBlur={handleBlur}
            error={touched.expiryDate && Boolean(errors.expiryDate)}
            helperText={touched.expiryDate && errors.expiryDate}
          />
        </Grid>

        {/* CVV */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="text"
            label="CVV"
            fullWidth
            name="cvv"
            placeholder="123"
            value={values.cvv || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").substring(0, 4);
              handleChange({
                target: { name: "cvv", value },
              });
            }}
            onBlur={handleBlur}
            error={touched.cvv && Boolean(errors.cvv)}
            helperText={touched.cvv && errors.cvv}
          />
        </Grid>
      </Grid>

      {/* Security Note */}
      <MDBox sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd", borderRadius: 1 }}>
        <MDTypography variant="caption" color="info">
          🔒 Your payment information is secure and encrypted
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

PaymentStep.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
};

export default PaymentStep;
