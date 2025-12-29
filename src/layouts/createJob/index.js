import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Grid,
  IconButton,
} from "@mui/material";
import SelectJobLocation from "components/SelectJobLocation";
import { Briefcase, CreditCard, CheckCircle, ChevronRight, Trash2 } from "lucide-react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbarContext } from "context/SnackbarContext";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import axiosInstance, {
  postJobWithRetry,
  getCustomerId,
  isAuthenticated,
} from "config/axiosConfig";

// // Temporary snackbar hook (replace with your actual one)
// const useSnackbarContext = () => {
//   return {
//     openSnackBar: (type, message) => {
//       alert(`${type.toUpperCase()}: ${message}`);
//     },
//   };
// };

// Calculate shift hours utility
const calculateShiftHours = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) return 0;
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  return (end - start) / (1000 * 60 * 60);
};

// Reusable Modal Component
const ReusableModal = ({
  open,
  onClose,
  title,
  confirmText,
  onConfirm,
  disableConfirm,
  children,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <MDTypography variant="h5">{title}</MDTypography>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <MDButton onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </MDButton>
        <MDButton onClick={onConfirm} color="info" variant="gradient" disabled={disableConfirm}>
          {confirmText}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
};

ReusableModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  confirmText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  disableConfirm: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

ReusableModal.defaultProps = {
  disableConfirm: false,
};

const CreateJobPage = () => {
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day");
  const [activeStep, setActiveStep] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState(false);
  const [jobDetailsModal, setJobDetailsModal] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [jobsQueue, setJobsQueue] = useState([]);

  const { openSnackBar } = useSnackbarContext();
  const navigate = useNavigate();

  // Helper function to get initial dates and times
  const getInitialDates = () => {
    const now = new Date();
    const startDateTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const endDateTime = new Date(startDateTime.getTime() + 8 * 60 * 60 * 1000);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const formatTime = (date) => {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    return {
      startDate: formatDate(startDateTime),
      startTime: formatTime(startDateTime),
      endDate: formatDate(endDateTime),
      endTime: formatTime(endDateTime),
    };
  };

  // Validation Schema
  const jobValidationSchema = Yup.object()
    .shape({
      type: Yup.string().required("job type is required"),
      description: Yup.string()
        .min(10, "Job Description must be at least 10 characters")
        .required("Job Description is required"),
      additionalDetails: Yup.string().optional(),
      marker: Yup.object()
        .shape({
          lat: Yup.number().required("Job location is required"),
          lng: Yup.number().required("Job location is required"),
          title: Yup.string().required("Job location is required"),
        })
        .test(
          "marker-required",
          "Job location is required",
          (value) => value && value.lat && value.lng
        ),
      searchRadius: Yup.number()
        .typeError("Radius must be a number")
        .positive("Radius must be greater than 0")
        .required("Search radius is required"),

      cardNumber: Yup.string()
        .matches(/^[0-9]{16}$/, "Card number must be 16 digits")
        .required("Card number is required"),
      cardHolderName: Yup.string()
        .min(3, "Card holder name must be at least 3 characters")
        .required("Card holder name is required"),
      expiryDate: Yup.string()
        .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format")
        .required("Expiry date is required"),
      cvv: Yup.string()
        .matches(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits")
        .required("CVV is required"),
      startDate: Yup.date().required("Start date is required"),
      startTime: Yup.string().required("Start time is required"),
      endDate: Yup.date().required("End date is required"),
      endTime: Yup.string().required("End time is required"),
      numberOfGuards: Yup.number()
        .min(1, "At least 1 guard is required")
        .max(99, "You cannot acquire more than 99 security personnel")
        .required("Number of guards is required"),
    })
    .test("datetime-validation", "Invalid date/time selection", function (values) {
      const { startDate, startTime, endDate, endTime } = values;

      if (!startDate || !startTime || !endDate || !endTime) {
        return true;
      }

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      const now = new Date();

      if (startDateTime < now) {
        return this.createError({
          path: "startDate",
          message: "Start date/time cannot be in the past",
        });
      }

      if (endDateTime < now) {
        return this.createError({
          path: "endDate",
          message: "End date/time cannot be in the past",
        });
      }

      if (endDateTime <= startDateTime) {
        return this.createError({
          path: "endDate",
          message: "End date/time must be after start date/time",
        });
      }

      const timeDifferenceInHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
      if (timeDifferenceInHours < 1) {
        return this.createError({
          path: "endDate",
          message: "Job duration must be at least 1 hour",
        });
      }

      return true;
    });

  const initialDates = getInitialDates();

  const initialValues = {
    title: "",
    type: "",
    description: "",
    additionalDetails: "",
    marker: {},
    searchRadius: 10,
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
    startDate: day ? day : initialDates.startDate,
    startTime: initialDates.startTime,
    endDate: day ? day : initialDates.endDate,
    endTime: initialDates.endTime,
    numberOfGuards: 1,
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
          });
          setLoading(false);
        },
        () => {
          setUserLocation({ lat: 40.7128, lng: -74.006 });
          setLoading(false);
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.006 });
      setLoading(false);
    }
  }, []);

  const handleNext = async (validateForm, setTouched, values) => {
    const errors = await validateForm();

    if (
      calculateShiftHours(values.startDate, values.startTime, values.endDate, values.endTime) < 1
    ) {
      openSnackBar("error", "End time cannot be earlier than Start time");
      return;
    }

    const stepFields = {
      0: [
        "type",
        "description",
        "startDate",
        "startTime",
        "endDate",
        "endTime",
        "numberOfGuards",
        "searchRadius",
        "marker",
      ],
      1: ["cardNumber", "cardHolderName", "expiryDate", "cvv"],
    };

    const fieldsToValidate = stepFields[activeStep];
    const stepErrors = {};
    const touched = {};

    fieldsToValidate.forEach((field) => {
      if (errors[field]) {
        stepErrors[field] = errors[field];
        touched[field] = true;
      }
    });

    setTouched(touched);

    if (Object.keys(stepErrors).length === 0) {
      if (activeStep === 0) {
        setJobDetailsModal(true);
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } else {
      openSnackBar("error", "please fill required fields to continue");
    }
  };

  const handleDeleteJob = (indexToDelete) => {
    setJobsQueue((prevQueue) => prevQueue.filter((_, index) => index !== indexToDelete));
  };

  const handleMakeAnotherJob = async (values, resetForm, validateForm, setTouched) => {
    const errors = await validateForm();

    if (
      calculateShiftHours(values.startDate, values.startTime, values.endDate, values.endTime) < 1
    ) {
      openSnackBar("error", "End time cannot be earlier than Start time");
      return;
    }

    const stepFields = {
      0: [
        "type",
        "description",
        "startDate",
        "startTime",
        "endDate",
        "endTime",
        "numberOfGuards",
        "marker",
      ],
      1: ["cardNumber", "cardHolderName", "expiryDate", "cvv"],
    };

    const fieldsToValidate = stepFields[activeStep];
    const stepErrors = {};
    const touched = {};

    fieldsToValidate.forEach((field) => {
      if (errors[field]) {
        stepErrors[field] = errors[field];
        touched[field] = true;
      }
    });

    setTouched(touched);

    if (Object.keys(stepErrors).length === 0) {
      const jobData = {
        type: values.type,
        description: values.description,
        additionalDetails: values.additionalDetails,
        marker: values.marker,
        searchRadius: values.searchRadius,
        startDate: values.startDate,
        startTime: values.startTime,
        endDate: values.endDate,
        endTime: values.endTime,
        numberOfGuards: values.numberOfGuards,
      };

      setJobsQueue((prev) => [...prev, jobData]);

      const initialDates = getInitialDates();
      resetForm({
        values: {
          ...values,
          type: "",
          description: "",
          additionalDetails: "",
          marker: {},
          searchRadius: 10,
          startDate: initialDates.startDate,
          startTime: initialDates.startTime,
          endDate: initialDates.endDate,
          endTime: initialDates.endTime,
          numberOfGuards: 1,
        },
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveStep(0);
    } else {
      openSnackBar("error", "please fill required fields to continue");
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log("handleSubmit called");

    if (!isAuthenticated()) {
      console.log("User not authenticated");
      openSnackBar("error", "Please log in to post a job");
      navigate("/authentication/sign-in");
      setSubmitting(false);
      return;
    }

    const customerId = getCustomerId();
    console.log("Customer ID:", customerId);

    if (!customerId) {
      openSnackBar("error", "Customer ID not found. Please log in again.");
      navigate("/authentication/sign-in");
      setSubmitting(false);
      return;
    }
    const currentJob = {
      type: values.type,
      description: values.description,
      additionalDetails: values.additionalDetails,
      marker: values.marker,
      searchRadius: values.searchRadius,
      startDate: values.startDate,
      startTime: values.startTime,
      endDate: values.endDate,
      endTime: values.endTime,
      numberOfGuards: values.numberOfGuards,
    };
    const allJobs = [...jobsQueue, currentJob];

    setLoading(true);
    let successCount = 0;
    const failedJobs = [];

    try {
      for (let i = 0; i < allJobs.length; i++) {
        const job = allJobs[i];

        try {
          const startDateTime = new Date(`${job.startDate}T${job.startTime}`);
          const endDateTime = new Date(`${job.endDate}T${job.endTime}`);

          const payload = {
            customer_id: customerId,
            title: job.type,
            description: job.description,
            address: job.marker.title,
            lat: String(job.marker.lat),
            lng: String(job.marker.lng),
            startTime: formatDateTimeForAPI(startDateTime),
            endTime: formatDateTimeForAPI(endDateTime),
            type: "asap",
            radius: job.searchRadius,
            numberOfGuards: job.numberOfGuards,
          };

          console.log(`Posting job ${i + 1}/${allJobs.length}:`, payload);

          // Make API call
          const response = await postJobWithRetry(payload);
          console.log(`Job ${i + 1} posted successfully:`, response.data);
          successCount++;
        } catch (jobErr) {
          console.error(`Failed to post job ${i + 1}:`, jobErr);

          let errorMessage = "Unknown error occurred";

          if (jobErr.response) {
            // Server responded with error
            errorMessage =
              jobErr.response.data?.message ||
              jobErr.response.data?.error ||
              `Server error: ${jobErr.response.status}`;
          } else if (jobErr.message) {
            // Network/timeout error
            errorMessage = jobErr.message;
          }

          console.error("Error details:", {
            message: errorMessage,
            response: jobErr.response?.data,
            status: jobErr.response?.status,
          });

          failedJobs.push({
            index: i + 1,
            job,
            error: errorMessage,
          });
        }
      }

      // Show appropriate success/error messages
      if (successCount === allJobs.length) {
        openSnackBar("success", `All ${successCount} Job(s) Created Successfully`);
        navigate("/dashboard");
      } else if (successCount > 0) {
        openSnackBar(
          "warning",
          `${successCount} of ${allJobs.length} Job(s) Created Successfully. ${failedJobs.length} failed.`
        );
        console.error("Failed jobs:", failedJobs);
      } else {
        const firstError = failedJobs[0]?.error || "Unknown error";
        openSnackBar("error", `Failed to create jobs: ${firstError}`);
        console.error("All jobs failed:", failedJobs);
      }
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      openSnackBar("error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  const handleDeleteCurrentJob = (resetForm, values) => {
    if (jobsQueue.length > 0) {
      const lastJob = jobsQueue[jobsQueue.length - 1];
      setJobsQueue((prevQueue) => prevQueue.slice(0, -1));

      resetForm({
        values: {
          ...values,
          type: lastJob.type,
          description: lastJob.description,
          additionalDetails: lastJob.additionalDetails || "",
          marker: lastJob.marker,
          searchRadius: lastJob.searchRadius,
          startDate: lastJob.startDate,
          startTime: lastJob.startTime,
          endDate: lastJob.endDate,
          endTime: lastJob.endTime,
          numberOfGuards: lastJob.numberOfGuards,
        },
      });

      openSnackBar("error", "Current job deleted. Previous job loaded.");
    } else {
      const initialDates = getInitialDates();
      resetForm({
        values: {
          ...values,
          type: "",
          description: "",
          additionalDetails: "",
          marker: {},
          searchRadius: 10,
          startDate: initialDates.startDate,
          startTime: initialDates.startTime,
          endDate: initialDates.endDate,
          endTime: initialDates.endTime,
          numberOfGuards: 1,
        },
      });

      openSnackBar("error", "Current job deleted.");
      setJobDetailsModal(false);
    }
  };

  // Format dates to match API requirement: "YYYY-MM-DD HH:MM:SS"
  const formatDateTimeForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const t = new Date(`1970-01-01T${time}`);
    return t.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const steps = [
    { label: "Job Info", icon: <Briefcase size={24} /> },
    { label: "Payment", icon: <CreditCard size={24} /> },
    { label: "Success", icon: <CheckCircle size={24} /> },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <MDTypography variant="h4">Loading...</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Formik
        initialValues={initialValues}
        validationSchema={jobValidationSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          validateForm,
          setTouched,
          isSubmitting,
          handleSubmit,
          resetForm,
        }) => (
          <MDBox py={3}>
            <Grid container spacing={3}>
              {/* Stepper */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    <MDBox
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      position="relative"
                    >
                      {steps.map((step, index) => (
                        <MDBox
                          key={index}
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          flex={1}
                          position="relative"
                          sx={{ cursor: index <= activeStep ? "pointer" : "default" }}
                          onClick={() => index <= activeStep && setActiveStep(index)}
                        >
                          <MDBox
                            width="48px"
                            height="48px"
                            borderRadius="lg"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            zIndex={10}
                            sx={{
                              backgroundColor: "white",
                              border: "2px solid",
                              borderColor:
                                activeStep === index
                                  ? "info.main"
                                  : activeStep > index
                                  ? "success.main"
                                  : "grey.300",
                              color:
                                activeStep === index
                                  ? "info.main"
                                  : activeStep > index
                                  ? "success.main"
                                  : "grey.500",
                            }}
                          >
                            {step.icon}
                          </MDBox>

                          <MDTypography
                            variant="caption"
                            color={activeStep > index ? "success" : "text"}
                            mt={1}
                            textAlign="center"
                          >
                            {step.label}
                          </MDTypography>

                          {index < steps.length - 1 && (
                            <MDBox
                              position="absolute"
                              top="24px"
                              right="-42%"
                              height="2px"
                              width="85%"
                              zIndex={1}
                              sx={{
                                backgroundColor: activeStep > index ? "success.main" : "grey.300",
                              }}
                            />
                          )}
                        </MDBox>
                      ))}
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Content Area */}
              <Grid item xs={12}>
                <Card>
                  <MDBox p={3}>
                    {/* Step 1: Job Information */}
                    {activeStep === 0 && (
                      <MDBox>
                        <MDTypography variant="h4" fontWeight="medium" mb={3}>
                          Job Information
                        </MDTypography>

                        <MDBox display="flex" flexDirection="column" gap={2}>
                          <FormControl
                            fullWidth
                            variant="outlined"
                            error={touched.type && Boolean(errors.type)}
                          >
                            <InputLabel id="job-type-label">Job Type</InputLabel>
                            <Select
                              labelId="job-type-label"
                              label="Job Type"
                              name="type"
                              value={values.type}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              sx={{ height: "50px" }}
                            >
                              <MenuItem value="">
                                <em>Select Job Type</em>
                              </MenuItem>
                              <MenuItem value="event security">Event Security</MenuItem>
                              <MenuItem value="residential security">Residential Security</MenuItem>
                              <MenuItem value="corporate security">Corporate Security</MenuItem>
                              <MenuItem value="personal bodyguard">Personal Bodyguard</MenuItem>
                              <MenuItem value="Others">Others</MenuItem>
                            </Select>
                            {touched.type && errors.type && (
                              <FormHelperText>{errors.type}</FormHelperText>
                            )}
                          </FormControl>

                          <TextField
                            fullWidth
                            label="Job Description"
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Describe the job responsibilities..."
                            variant="outlined"
                            multiline
                            rows={3}
                            error={touched.description && Boolean(errors.description)}
                            helperText={touched.description && errors.description}
                          />

                          <TextField
                            fullWidth
                            label="Additional Details (Optional)"
                            name="additionalDetails"
                            value={values.additionalDetails}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Describe additional job details..."
                            multiline
                            rows={4}
                            variant="outlined"
                            error={touched.additionalDetails && Boolean(errors.additionalDetails)}
                            helperText={touched.additionalDetails && errors.additionalDetails}
                          />

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <MDTypography variant="h6" mb={1}>
                                Job Start
                              </MDTypography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Start Date"
                                    name="startDate"
                                    type="date"
                                    value={values.startDate}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    error={touched.startDate && Boolean(errors.startDate)}
                                    helperText={touched.startDate && errors.startDate}
                                    inputProps={{
                                      min: new Date().toISOString().split("T")[0],
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Start Time"
                                    name="startTime"
                                    type="time"
                                    value={values.startTime}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    error={touched.startTime && Boolean(errors.startTime)}
                                    helperText={touched.startTime && errors.startTime}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <MDTypography variant="h6" mb={1}>
                                Job End
                              </MDTypography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="End Date"
                                    name="endDate"
                                    type="date"
                                    value={values.endDate}
                                    onChange={(e) => {
                                      handleChange(e);
                                      setTimeout(() => validateForm(), 100);
                                    }}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    error={touched.endDate && Boolean(errors.endDate)}
                                    helperText={touched.endDate && errors.endDate}
                                    inputProps={{
                                      min: new Date().toISOString().split("T")[0],
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="End Time"
                                    name="endTime"
                                    type="time"
                                    value={values.endTime}
                                    onChange={(e) => {
                                      handleChange(e);
                                      setTimeout(() => validateForm(), 100);
                                    }}
                                    onBlur={handleBlur}
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    error={touched.endTime && Boolean(errors.endTime)}
                                    helperText={touched.endTime && errors.endTime}
                                  />
                                </Grid>
                              </Grid>
                            </Grid>
                          </Grid>

                          <MDBox>
                            <MDTypography variant="h6" mb={1}>
                              Number of Guards
                            </MDTypography>
                            <MDBox display="flex" alignItems="center" gap={2}>
                              <IconButton
                                onClick={() =>
                                  setFieldValue(
                                    "numberOfGuards",
                                    Math.max(1, values.numberOfGuards - 1)
                                  )
                                }
                                sx={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: "grey.200",
                                  "&:hover": { backgroundColor: "grey.300" },
                                }}
                              >
                                <MDTypography variant="h5">−</MDTypography>
                              </IconButton>

                              <MDTypography variant="h5" fontWeight="medium">
                                {values.numberOfGuards}
                              </MDTypography>

                              <IconButton
                                onClick={() =>
                                  setFieldValue("numberOfGuards", values.numberOfGuards + 1)
                                }
                                sx={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: "info.main",
                                  color: "white",
                                  "&:hover": { backgroundColor: "info.dark" },
                                }}
                              >
                                <MDTypography variant="h5" color="white">
                                  +
                                </MDTypography>
                              </IconButton>

                              <MDTypography variant="h5" color="text" ml={4}>
                                Total hours:{" "}
                                {(
                                  calculateShiftHours(
                                    values.startDate,
                                    values.startTime,
                                    values.endDate,
                                    values.endTime
                                  ) * values.numberOfGuards
                                ).toFixed(2)}
                              </MDTypography>
                            </MDBox>

                            {calculateShiftHours(
                              values.startDate,
                              values.startTime,
                              values.endDate,
                              values.endTime
                            ) < 1 && (
                              <MDTypography variant="caption" color="error" mt={1}>
                                End time cannot be earlier than Start time
                              </MDTypography>
                            )}

                            {touched.numberOfGuards && errors.numberOfGuards && (
                              <MDTypography variant="caption" color="error" mt={1}>
                                {errors.numberOfGuards}
                              </MDTypography>
                            )}
                          </MDBox>
                        </MDBox>

                        <MDBox mt={4}>
                          <MDTypography variant="h4" fontWeight="medium" mb={2}>
                            Job Location
                          </MDTypography>
                          <SelectJobLocation
                            marker={values.marker}
                            setMarker={(marker) => setFieldValue("marker", marker)}
                          />
                          {touched.marker && errors.marker && (
                            <MDTypography variant="caption" color="error" mt={1}>
                              {typeof errors.marker === "string"
                                ? errors.marker
                                : "Job location is required"}
                            </MDTypography>
                          )}
                        </MDBox>
                        <MDBox mt={3}>
                          <MDTypography variant="h6" mb={1}>
                            Search Area for Available Guards
                          </MDTypography>

                          <MDTypography variant="caption" color="text" mb={2} display="block">
                            Guards within this distance from the job location will receive your
                            request
                          </MDTypography>

                          <MDInput
                            type="number"
                            name="searchRadius"
                            value={values.searchRadius}
                            onChange={(e) => setFieldValue("searchRadius", e.target.value)}
                            placeholder="Enter radius in miles"
                            fullWidth
                            inputProps={{
                              step: "0.1",
                            }}
                          />

                          {touched.searchRadius && errors.searchRadius && (
                            <MDTypography variant="caption" color="error" mt={1}>
                              {errors.searchRadius}
                            </MDTypography>
                          )}

                          <MDBox
                            mt={2}
                            p={2}
                            sx={{
                              backgroundColor: "light.main",
                              borderRadius: "8px",
                              border: "1px solid",
                              borderColor: "info.main",
                            }}
                          >
                            <MDTypography variant="caption" color="info">
                              💡 <strong>Tip:</strong> Enter the distance in miles. Larger distances
                              may increase availability but could also increase travel costs.
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      </MDBox>
                    )}

                    {/* Step 2: Payment */}
                    {activeStep === 1 && (
                      <MDBox>
                        <MDTypography variant="h4" fontWeight="medium" mb={3}>
                          Payment Details
                        </MDTypography>

                        {/* Jobs Queue */}
                        {jobsQueue.length > 0 && (
                          <MDBox mb={3}>
                            <MDTypography variant="h6" color="text" mb={2}>
                              Jobs in Queue ({jobsQueue.length})
                            </MDTypography>
                            <MDBox display="flex" flexDirection="column" gap={2}>
                              {jobsQueue.map((job, index) => (
                                <Card
                                  key={index}
                                  sx={{
                                    backgroundColor: "grey.100",
                                    border: "1px solid",
                                    borderColor: "grey.300",
                                  }}
                                >
                                  <MDBox p={2}>
                                    <MDBox
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                    >
                                      <MDBox>
                                        <MDTypography variant="h6" fontWeight="medium">
                                          {job.type}
                                        </MDTypography>
                                        <MDTypography variant="caption" color="text">
                                          {job.numberOfGuards} Guard(s) •{" "}
                                          {formatDateTime(job.startDate, job.startTime)}
                                        </MDTypography>
                                      </MDBox>
                                      <MDTypography variant="h6" color="info" fontWeight="medium">
                                        ${(job.numberOfGuards * 50 * 1.1).toFixed(2)}
                                      </MDTypography>
                                    </MDBox>
                                  </MDBox>
                                </Card>
                              ))}
                            </MDBox>
                          </MDBox>
                        )}

                        {/* Current Job Summary */}
                        <Card
                          sx={{
                            background: "linear-gradient(to right, #E3F2FD, #C5CAE9)",
                            mb: 3,
                          }}
                        >
                          <MDBox p={3}>
                            <MDTypography variant="h6" fontWeight="medium" mb={2}>
                              Current Job Summary
                            </MDTypography>
                            <MDBox display="flex" flexDirection="column" gap={2}>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  Job Title:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {values.type || "N/A"}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  Number of Guards:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {values.numberOfGuards || "N/A"}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  Start Date:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {formatDate(values.startDate)}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  Start Time:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {formatTime(values.startTime)}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  End Date:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {formatDate(values.endDate)}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  End Time:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  {formatTime(values.endTime)}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" justifyContent="space-between">
                                <MDTypography variant="body2" color="text">
                                  GST:
                                </MDTypography>
                                <MDTypography variant="body2" fontWeight="medium">
                                  10%
                                </MDTypography>
                              </MDBox>
                              <MDBox
                                display="flex"
                                justifyContent="space-between"
                                pt={2}
                                sx={{
                                  borderTop: "1px solid",
                                  borderColor: "grey.400",
                                }}
                              >
                                <MDTypography variant="h6" color="text">
                                  Job Amount:
                                </MDTypography>
                                <MDTypography variant="h5" color="info">
                                  ${(values.numberOfGuards * 50 * 1.1).toFixed(2) || "0.00"}
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </Card>

                        {/* Total Amount */}
                        <Card
                          sx={{
                            backgroundColor: "success.light",
                            border: "1px solid",
                            borderColor: "success.main",
                            mb: 3,
                          }}
                        >
                          <MDBox p={2}>
                            <MDBox
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <MDTypography variant="h6" fontWeight="medium">
                                Total Amount ({jobsQueue.length + 1} Job(s)):
                              </MDTypography>
                              <MDTypography variant="h4" color="success">
                                $
                                {[...jobsQueue, { numberOfGuards: values.numberOfGuards }]
                                  .reduce((sum, job) => sum + job.numberOfGuards * 50 * 1.1, 0)
                                  .toFixed(2)}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Card>

                        {/* Payment Form */}
                        <MDBox display="flex" flexDirection="column" gap={2}>
                          <TextField
                            fullWidth
                            label="Card Number"
                            name="cardNumber"
                            value={values.cardNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="1234567890123456"
                            variant="outlined"
                            error={touched.cardNumber && Boolean(errors.cardNumber)}
                            helperText={touched.cardNumber && errors.cardNumber}
                          />

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Expiry Date"
                                name="expiryDate"
                                value={values.expiryDate}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="MM/YY"
                                variant="outlined"
                                error={touched.expiryDate && Boolean(errors.expiryDate)}
                                helperText={touched.expiryDate && errors.expiryDate}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="CVV"
                                name="cvv"
                                value={values.cvv}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="123"
                                type="password"
                                variant="outlined"
                                error={touched.cvv && Boolean(errors.cvv)}
                                helperText={touched.cvv && errors.cvv}
                              />
                            </Grid>
                          </Grid>

                          <TextField
                            fullWidth
                            label="Cardholder Name"
                            name="cardHolderName"
                            value={values.cardHolderName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="John Doe"
                            variant="outlined"
                            error={touched.cardHolderName && Boolean(errors.cardHolderName)}
                            helperText={touched.cardHolderName && errors.cardHolderName}
                          />
                        </MDBox>
                      </MDBox>
                    )}

                    {/* Step 3: Success */}
                    {activeStep === 2 && (
                      <MDBox textAlign="center">
                        <MDBox mb={3}>
                          <CheckCircle size={80} color="#4CAF50" />
                        </MDBox>
                        <MDTypography variant="h3" color="success" mb={2}>
                          Payment done Successfully!
                        </MDTypography>
                        <MDTypography variant="body1" color="text">
                          Please click Post job button to post your jobs
                        </MDTypography>
                      </MDBox>
                    )}

                    {/* Navigation Buttons */}
                    <MDBox display="flex" justifyContent="space-between" mt={4} pt={3}>
                      <MDButton
                        variant="outlined"
                        color="info"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                      >
                        Back
                      </MDButton>

                      {activeStep === steps.length - 1 ? (
                        <MDButton
                          variant="gradient"
                          color="success"
                          onClick={() => handleSubmit(values, { setSubmitting: isSubmitting })}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Post Job"}
                        </MDButton>
                      ) : (
                        <MDBox display="flex" gap={2}>
                          {jobsQueue.length > 0 && (
                            <MDButton
                              variant="gradient"
                              color="error"
                              onClick={() => {
                                setJobsQueue((prevQueue) => prevQueue.slice(0, -1));
                                openSnackBar("error", "Last job removed from the queue");
                              }}
                            >
                              Delete Last Job
                            </MDButton>
                          )}
                          <MDButton
                            variant="outlined"
                            color="dark"
                            onClick={() =>
                              handleMakeAnotherJob(values, resetForm, validateForm, setTouched)
                            }
                          >
                            + Add Another Job
                          </MDButton>

                          <MDButton
                            variant="gradient"
                            color="info"
                            onClick={() => {
                              handleNext(validateForm, setTouched, values);
                            }}
                          >
                            Next
                            <ChevronRight size={20} style={{ marginLeft: 4 }} />
                          </MDButton>
                        </MDBox>
                      )}
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>

            {/* Payment Modal */}
            <ReusableModal
              open={paymentModal}
              onClose={() => setPaymentModal(false)}
              title="Before You Proceed to Payment"
              confirmText="Continue to Payment"
              disableConfirm={!agreeToTerms}
              onConfirm={() => {
                if (agreeToTerms) {
                  setActiveStep(1);
                  setPaymentModal(false);
                }
              }}
            >
              <MDBox>
                <Box
                  sx={{
                    maxHeight: 250,
                    overflowY: "auto",
                    borderRadius: "8px",
                    p: 2,
                  }}
                >
                  <MDTypography variant="h6" gutterBottom>
                    Terms and Conditions
                  </MDTypography>

                  <MDTypography variant="body2" paragraph>
                    Welcome to our on-demand security guard booking platform (&quot;the
                    Platform&quot;), a service designed to connect clients and licensed security
                    guards in Australia. By using this Platform, you agree to the following Terms
                    and Conditions (&quot;Terms&quot;). Please read them carefully before proceeding
                    with any booking or payment.
                  </MDTypography>

                  <MDTypography variant="subtitle2" fontWeight="medium">
                    1. Secure Payment & Dispute Policy
                  </MDTypography>
                  <MDTypography variant="body2" paragraph>
                    • All client payments are securely held in escrow until the booked job is
                    completed and approved by the client.
                    <br />• Once a job is marked complete and approved, funds will be released to
                    the assigned guard.
                    <br />• If an issue arises, clients may raise a dispute before the release of
                    funds.
                    <br />• In the event of a dispute, payments may be temporarily held while the
                    issue is reviewed by our support team.
                  </MDTypography>

                  <MDTypography variant="subtitle2" fontWeight="medium">
                    4. Booking & Matching Process
                  </MDTypography>
                  <MDTypography variant="body2" paragraph>
                    • Once a guard accepts, both parties receive each other&apos;s details including
                    name, license number, and contact information.
                  </MDTypography>

                  <MDTypography variant="subtitle2" fontWeight="medium">
                    9. Acceptance
                  </MDTypography>
                  <MDTypography variant="body2" paragraph>
                    By checking the agreement box and continuing to payment, you confirm that you
                    have read, understood, and agreed to these Terms and Conditions.
                  </MDTypography>
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <MDTypography variant="body2">
                      I agree to the{" "}
                      <span
                        style={{ color: "#1976d2", cursor: "pointer", textDecoration: "underline" }}
                      >
                        Terms and Conditions
                      </span>
                      .
                    </MDTypography>
                  }
                />
              </MDBox>
            </ReusableModal>

            {/* Job Details Modal */}
            <ReusableModal
              open={jobDetailsModal}
              onClose={() => setJobDetailsModal(false)}
              title="Your Job Details"
              confirmText="Confirm"
              onConfirm={() => {
                setJobDetailsModal(false);
                setTimeout(() => {
                  setPaymentModal(true);
                }, 100);
              }}
            >
              <MDBox>
                {jobsQueue.length > 0 && (
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" mb={2}>
                      Jobs in Queue ({jobsQueue.length})
                    </MDTypography>
                    <MDBox display="flex" flexDirection="column" gap={2}>
                      {jobsQueue.map((job, index) => (
                        <Card
                          key={index}
                          sx={{
                            backgroundColor: "grey.100",
                            border: "1px solid",
                            borderColor: "grey.300",
                          }}
                        >
                          <MDBox p={2}>
                            <MDBox
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <MDBox>
                                <MDTypography variant="h6" fontWeight="medium">
                                  {job.type}
                                </MDTypography>
                                <MDTypography variant="caption" color="text">
                                  {job.numberOfGuards} Guard(s) • {formatDate(job.startDate)} at{" "}
                                  {formatTime(job.startTime)}
                                </MDTypography>
                              </MDBox>
                              <MDBox display="flex" alignItems="center" gap={2}>
                                <MDTypography variant="body2" color="info" fontWeight="medium">
                                  ${(job.numberOfGuards * 50).toFixed(2)}
                                </MDTypography>
                                <IconButton
                                  onClick={() => handleDeleteJob(index)}
                                  size="small"
                                  sx={{
                                    color: "grey.500",
                                    "&:hover": { color: "error.main" },
                                  }}
                                >
                                  <Trash2 size={18} strokeWidth={1.8} />
                                </IconButton>
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </Card>
                      ))}
                    </MDBox>
                  </MDBox>
                )}

                <Card
                  sx={{
                    background: "linear-gradient(to right, #E3F2FD, #C5CAE9)",
                  }}
                >
                  <MDBox p={3}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDTypography variant="h6" fontWeight="medium">
                        Current Job Summary
                      </MDTypography>
                      <IconButton
                        onClick={() => {
                          handleDeleteCurrentJob(resetForm, values);
                        }}
                        size="small"
                        sx={{
                          color: "grey.500",
                          "&:hover": { color: "error.main" },
                        }}
                      >
                        <Trash2 size={18} strokeWidth={1.8} />
                      </IconButton>
                    </MDBox>

                    <MDBox display="flex" flexDirection="column" gap={2}>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          Job Title:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {values.type || "N/A"}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          Number of Guards:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {values.numberOfGuards || "N/A"}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          Start Date:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(values.startDate)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          Start Time:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatTime(values.startTime)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          End Date:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatDate(values.endDate)}
                        </MDTypography>
                      </MDBox>
                      <MDBox display="flex" justifyContent="space-between">
                        <MDTypography variant="body2" color="text">
                          End Time:
                        </MDTypography>
                        <MDTypography variant="body2" fontWeight="medium">
                          {formatTime(values.endTime)}
                        </MDTypography>
                      </MDBox>
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        pt={2}
                        sx={{
                          borderTop: "1px solid",
                          borderColor: "grey.400",
                        }}
                      >
                        <MDTypography variant="h6" color="text">
                          Job Amount:
                        </MDTypography>
                        <MDTypography variant="h5" color="info">
                          ${(values.numberOfGuards * 50).toFixed(2) || "0.00"}
                        </MDTypography>
                      </MDBox>
                    </MDBox>
                  </MDBox>
                </Card>
              </MDBox>
            </ReusableModal>
          </MDBox>
        )}
      </Formik>
    </DashboardLayout>
  );
};

export default CreateJobPage;
