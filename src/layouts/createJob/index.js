// pages/CreateJobPage/index.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Formik } from "formik";
import { useSnackbarContext } from "../../context/SnackbarContext";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import { Stepper, Step, StepLabel } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Components
import JobInfoStep from "./components/jobInfoStep";
import PaymentStep from "./components/paymentStep";
import JobDetailsModal from "./components/JobDetailsModal";
import LoadingScreen from "../../components/LoadingScreen";

// Utils and Config
import { jobValidationSchema, getInitialValues, getInitialDates } from "./config/formConfig";
import { handleJobSubmit, handleMakeAnotherJob, handleDeleteCurrentJob } from "./utils/jobHandlers";
import { getUserLocation } from "./utils/locationUtils";

const STEPS = ["Job Information", "Payment Details"];

const CreateJobPage = () => {
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day");

  const [activeStep, setActiveStep] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobDetailsModal, setJobDetailsModal] = useState(false);
  const [jobsQueue, setJobsQueue] = useState([]);

  const { showSnackbar } = useSnackbarContext();
  const navigate = useNavigate();

  // Get user's current location on mount
  useEffect(() => {
    getUserLocation(setUserLocation, setLoading);
  }, []);

  const handleNext = async (validateForm, setTouched, values, touched) => {
    const errors = await validateForm();

    const stepFields = {
      0: ["type", "description", "startDate", "startTime", "endDate", "endTime", "numberOfGuards"],
      1: ["cardNumber", "cardHolderName", "expiryDate", "cvv"],
    };

    const fieldsToValidate = stepFields[activeStep];
    const newTouched = { ...touched };

    let hasErrors = false;

    fieldsToValidate.forEach((field) => {
      newTouched[field] = true; // mark as touched
      if (errors[field]) {
        hasErrors = true;
      }
    });

    setTouched(newTouched);

    if (!hasErrors) {
      if (activeStep === 0) {
        setJobDetailsModal(true);
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } else {
      showSnackbar("Please fill required fields to continue", "error");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleDeleteJob = (indexToDelete) => {
    setJobsQueue((prevQueue) => prevQueue.filter((_, index) => index !== indexToDelete));
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Formik
      initialValues={getInitialValues(day)}
      validationSchema={jobValidationSchema}
      onSubmit={(values, formikBag) =>
        handleJobSubmit(values, formikBag, jobsQueue, setLoading, showSnackbar, navigate)
      }
      validateOnChange={true}
      validateOnBlur={true}
    >
      {(formikProps) => {
        const {
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          validateForm,
          setTouched,
          handleSubmit,
          resetForm,
        } = formikProps;

        return (
          <DashboardLayout>
            <DashboardNavbar />
            <MDBox py={3}>
              {/* Header */}
              <MDBox mb={4} px={3}>
                <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
                  Create New Job
                </MDTypography>
                <MDTypography variant="body2" color="text" opacity={0.7}>
                  Fill in the job details and proceed to payment
                </MDTypography>
              </MDBox>

              {/* Stepper */}
              <MDBox mb={4} px={3}>
                <Stepper activeStep={activeStep}>
                  {STEPS.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </MDBox>

              {/* Content Area */}
              <Grid container spacing={3} sx={{ px: { xs: 2, sm: 3 } }}>
                <Grid item xs={12}>
                  <MDBox
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 2,
                      p: { xs: 2, sm: 3, md: 4 },
                      boxShadow: "0 2px 14px 0 rgb(32 40 45 / 8%)",
                    }}
                  >
                    {activeStep === 0 && (
                      <JobInfoStep
                        values={values}
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        setFieldValue={setFieldValue}
                        validateForm={validateForm}
                        userLocation={userLocation}
                      />
                    )}

                    {activeStep === 1 && (
                      <PaymentStep
                        values={values}
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        jobsQueue={jobsQueue}
                      />
                    )}
                  </MDBox>
                </Grid>

                {/* Navigation Buttons */}
                <Grid item xs={12}>
                  <MDBox
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                    }}
                  >
                    <MDButton
                      variant="gradient"
                      color="secondary"
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      fullWidth={false}
                    >
                      Back
                    </MDButton>

                    <MDButton
                      variant="gradient"
                      color="info"
                      onClick={() => handleNext(validateForm, setTouched, values, touched)}
                      fullWidth={false}
                    >
                      {activeStep === 1 ? "Review & Continue" : "Next"}
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>

              {/* Jobs Queue Display */}
              {jobsQueue.length > 0 && (
                <MDBox
                  sx={{
                    mt: 4,
                    px: 3,
                    p: 3,
                    backgroundColor: "#e8f5e9",
                    borderRadius: 2,
                    border: "1px solid #4caf50",
                  }}
                >
                  <MDTypography variant="h6" color="success" mb={2}>
                    Jobs in Queue ({jobsQueue.length})
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    You have {jobsQueue.length} job(s) ready to submit. Continue through the payment
                    step to finalize all jobs.
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>

            {/* Job Details Modal */}
            <JobDetailsModal
              open={jobDetailsModal}
              onClose={() => setJobDetailsModal(false)}
              values={values}
              jobsQueue={jobsQueue}
              onMakeAnother={() =>
                handleMakeAnotherJob(
                  values,
                  resetForm,
                  validateForm,
                  setTouched,
                  activeStep,
                  setJobsQueue,
                  setActiveStep,
                  showSnackbar
                )
              }
              onContinue={() => {
                setJobDetailsModal(false);
                setActiveStep(1);
              }}
              onDelete={() =>
                handleDeleteCurrentJob(
                  resetForm,
                  values,
                  jobsQueue,
                  setJobsQueue,
                  setJobDetailsModal,
                  showSnackbar
                )
              }
            />
          </DashboardLayout>
        );
      }}
    </Formik>
  );
};

export default CreateJobPage;
