import React from "react";
import MDBox from "components/MDBox";

export default function jobFormStepper({ steps, activeStep, setActiveStep }) {
  return (
    <MDBox display="flex" justifyContent="space-between" mb={3}>
      {steps.map((step, index) => (
        <div
          key={index}
          onClick={() => setActiveStep(index)}
          style={{
            cursor: index <= activeStep ? "pointer" : "default",
            opacity: index <= activeStep ? 1 : 0.5,
          }}
        >
          {step.label}
        </div>
      ))}
    </MDBox>
  );
}
