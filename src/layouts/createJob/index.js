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
import { Briefcase, CreditCard, CheckCircle, ChevronRight, Trash2, Edit2 } from "lucide-react";
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
import { margin } from "@mui/system";

// Rate structure
const RATES = {
  DAY: 10, // 6 AM - 6 PM on weekdays
  NIGHT: 12, // 6 PM - 6 AM on weekdays
  WEEKEND: 17, // All hours on Saturday/Sunday
  HOLIDAY: 20, // Public holidays
};

// Australian Public Holidays 2025-2026
const PUBLIC_HOLIDAYS = [
  "2025-01-01",
  "2025-01-27",
  "2025-03-10",
  "2025-04-18",
  "2025-04-19",
  "2025-04-21",
  "2025-04-25",
  "2025-06-09",
  "2025-11-04",
  "2025-12-25",
  "2025-12-26",
  "2026-01-01",
  "2026-01-26",
  "2026-03-02",
  "2026-04-03",
  "2026-04-04",
  "2026-04-06",
  "2026-04-25",
  "2026-06-08",
  "2026-11-03",
  "2026-12-25",
  "2026-12-26",
];

// Check if date is a public holiday
const isPublicHoliday = (date) => {
  const dateStr = date.toISOString().split("T")[0];
  return PUBLIC_HOLIDAYS.includes(dateStr);
};

// Check if date is weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Calculate shift hours utility
const calculateShiftHours = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime || !endDate || !endTime) return 0;
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  return (end - start) / (1000 * 60 * 60);
};

// Calculate cost breakdown by hour type
const calculateJobCost = (startDate, startTime, endDate, endTime, numberOfGuards) => {
  if (!startDate || !startTime || !endDate || !endTime) {
    return { total: 0, breakdown: [], totalHours: 0 };
  }

  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const totalHours = (end - start) / (1000 * 60 * 60);

  if (totalHours <= 0) {
    return { total: 0, breakdown: [], totalHours: 0 };
  }

  let dayHours = 0;
  let nightHours = 0;
  let weekendHours = 0;
  let holidayHours = 0;

  // Iterate through each hour
  let current = new Date(start);
  while (current < end) {
    const hour = current.getHours();
    const nextHour = new Date(current.getTime() + 60 * 60 * 1000);
    const hourDuration = Math.min(
      (nextHour - current) / (1000 * 60 * 60),
      (end - current) / (1000 * 60 * 60)
    );

    if (isPublicHoliday(current)) {
      holidayHours += hourDuration;
    } else if (isWeekend(current)) {
      weekendHours += hourDuration;
    } else if (hour >= 6 && hour < 18) {
      dayHours += hourDuration;
    } else {
      nightHours += hourDuration;
    }

    current = nextHour;
  }

  const breakdown = [];
  let subtotal = 0;

  if (dayHours > 0) {
    const cost = dayHours * RATES.DAY * numberOfGuards;
    subtotal += cost;
    breakdown.push({ type: "Day Hours (6 AM - 6 PM)", hours: dayHours, rate: RATES.DAY, cost });
  }
  if (nightHours > 0) {
    const cost = nightHours * RATES.NIGHT * numberOfGuards;
    subtotal += cost;
    breakdown.push({
      type: "Night Hours (6 PM - 6 AM)",
      hours: nightHours,
      rate: RATES.NIGHT,
      cost,
    });
  }
  if (weekendHours > 0) {
    const cost = weekendHours * RATES.WEEKEND * numberOfGuards;
    subtotal += cost;
    breakdown.push({ type: "Weekend Hours", hours: weekendHours, rate: RATES.WEEKEND, cost });
  }
  if (holidayHours > 0) {
    const cost = holidayHours * RATES.HOLIDAY * numberOfGuards;
    subtotal += cost;
    breakdown.push({
      type: "Public Holiday Hours",
      hours: holidayHours,
      rate: RATES.HOLIDAY,
      cost,
    });
  }

  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  return { total, subtotal, gst, breakdown, totalHours };
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
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [jobsQueue, setJobsQueue] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
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
          lat: Yup.number().required("location is required"),
          lng: Yup.number().required("location is required"),
          title: Yup.string().required("location is required"),
        })
        .test(
          "marker-required",
          "location is required",
          (value) => value && value.lat && value.lng
        ),
      searchRadius: Yup.number()
        .typeError("Radius must be a number")
        .positive("Radius must be greater than 0")
        .required("Search radius is required"),

      startDate: Yup.date().required("Start date is required"),
      startTime: Yup.string().required("Start time is required"),
      endDate: Yup.date().required("End date is required"),
      endTime: Yup.string().required("End time is required"),
      numberOfGuards: Yup.number()
        .min(1, "At least 1 guard is required")
        .max(99, "You cannot acquire more than 99 security personnel")
        .required("Number of guards is required"),
      cardName: Yup.string()
        .matches(/^[a-zA-Z ]+$/, "Only letters allowed")
        .min(3, "Too short")
        .required("Cardholder name is required"),

      cardNumber: Yup.string()
        .matches(/^\d{16}$/, "Card number must be 16 digits")
        .required("Card number is required"),

      expiry: Yup.string()
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format")
        .test("expiry-valid", "Card has expired", (value) => {
          if (!value) return false;
          const [month, year] = value.split("/");
          const expiryDate = new Date(`20${year}`, month);
          return expiryDate > new Date();
        })
        .required("Expiry date is required"),

      cvv: Yup.string()
        .matches(/^\d{3,4}$/, "CVV must be 3 or 4 digits")
        .required("CVV is required"),
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

  const handleFileUpload = async (event, setFieldValue) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      openSnackBar("error", "Please upload a PDF file only");
      event.target.value = null; // Reset input
      return;
    }

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", file); // Binary file
      formData.append("folder", "job_roster");

      const response = await axiosInstance.post(
        "/upload-file", // Use relative path since base URL is already in axiosInstance
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.url) {
        setFieldValue("job_instructions", response.data.url);
        openSnackBar("success", "File uploaded successfully");
      } else {
        openSnackBar("error", "Failed to get file URL from server");
      }
    } catch (error) {
      console.error("File upload error:", error);
      const errorMsg = error.response?.data?.message || "Failed to upload file";
      openSnackBar("error", errorMsg);
    } finally {
      setUploadingFile(false);
      event.target.value = null; // Reset input for re-upload
    }
  };
  const initialDates = getInitialDates();

  const initialValues = {
    title: "",
    type: "",
    description: "",
    additionalDetails: "",
    job_instructions: "",
    marker: {},
    searchRadius: 10,
    startDate: day ? day : initialDates.startDate,
    startTime: initialDates.startTime,
    endDate: day ? day : initialDates.endDate,
    endTime: initialDates.endTime,
    numberOfGuards: 1,
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
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
      1: [],
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
      setActiveStep((prev) => prev + 1);
    } else {
      openSnackBar("error", "please fill required fields to continue");
    }
  };

  const handleDeleteJob = (indexToDelete) => {
    setJobsQueue((prevQueue) => prevQueue.filter((_, index) => index !== indexToDelete));
  };

  const handleEditJob = (index, setFieldValue) => {
    const job = jobsQueue[index];
    setFieldValue("type", job.type);
    setFieldValue("description", job.description);
    setFieldValue("additionalDetails", job.additionalDetails || "");
    setFieldValue("job_instructions", job.job_instructions || "");
    setFieldValue("marker", { ...job.marker });
    setFieldValue("searchRadius", job.searchRadius);
    setFieldValue("startDate", job.startDate);
    setFieldValue("startTime", job.startTime);
    setFieldValue("endDate", job.endDate);
    setFieldValue("endTime", job.endTime);
    setFieldValue("numberOfGuards", job.numberOfGuards);
    setJobsQueue((prevQueue) => prevQueue.filter((_, i) => i !== index));
  };

  const handleMakeAnotherJob = async (
    values,
    resetForm,
    validateForm,
    setTouched,
    setFieldValue
  ) => {
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
      1: [],
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
        job_instructions: values.job_instructions,
        marker: { ...values.marker },
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
          job_instructions: "",
          marker: { ...values.marker },
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

    // Add current job to the queue before processing
    const currentJob = {
      type: values.type,
      description: values.description,
      additionalDetails: values.additionalDetails,
      job_instructions: values.job_instructions,
      marker: { ...values.marker },
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

    // Set concurrent limit to 3 jobs at a time to prevent overwhelming the API
    const CONCURRENT_LIMIT = 3;

    try {
      // Process jobs in batches of CONCURRENT_LIMIT
      for (let i = 0; i < allJobs.length; i += CONCURRENT_LIMIT) {
        const batch = allJobs.slice(i, i + CONCURRENT_LIMIT);

        // Process current batch concurrently
        const batchPromises = batch.map(async (job, batchIndex) => {
          const jobIndex = i + batchIndex;

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
              state: "Victoria",
              // state: job.marker.state || "",
              fjob_instrcutions: job.job_instructions || "",
            };

            console.log(`Posting job ${jobIndex + 1}/${allJobs.length}:`, payload);

            const response = await postJobWithRetry(payload);
            console.log(`Job ${jobIndex + 1} posted successfully:`, response.data);

            return { success: true, jobIndex };
          } catch (jobErr) {
            console.error(`Failed to post job ${jobIndex + 1}:`, jobErr);

            let errorMessage = "Unknown error occurred";

            if (jobErr.response) {
              errorMessage =
                jobErr.response.data?.message ||
                jobErr.response.data?.error ||
                `Server error: ${jobErr.response.status}`;
            } else if (jobErr.message) {
              errorMessage = jobErr.message;
            }

            return {
              success: false,
              jobIndex,
              job,
              error: errorMessage,
            };
          }
        });

        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises);

        // Process batch results
        batchResults.forEach((result) => {
          if (result.success) {
            successCount++;
          } else {
            failedJobs.push({
              index: result.jobIndex + 1,
              job: result.job,
              error: result.error,
            });
          }
        });
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

  const formatDateTime = (date, time) => {
    if (!date || !time) return "N/A";
    return `${formatDate(date)} at ${formatTime(time)}`;
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
                        {jobsQueue.length > 0 && (
                          <MDBox mb={3}>
                            <MDTypography variant="h6" color="text" mb={2}>
                              Queued Jobs ({jobsQueue.length})
                            </MDTypography>
                            <MDBox display="flex" flexDirection="column" gap={2}>
                              {jobsQueue.map((job, index) => (
                                <Card
                                  key={index}
                                  sx={{
                                    background: "linear-gradient(to right, #E3F2FD, #C5CAE9)",
                                  }}
                                >
                                  <MDBox p={3}>
                                    <MDBox
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                      mb={2}
                                    >
                                      <MDTypography variant="h6" fontWeight="medium">
                                        Job {index + 1} - {job.type || "Untitled Job"}
                                      </MDTypography>
                                      <MDBox display="flex" gap={1}>
                                        <IconButton
                                          onClick={() => {
                                            handleEditJob(index, setFieldValue);
                                            setActiveStep(0);
                                          }}
                                          size="small"
                                          sx={{
                                            color: "grey.600",
                                            "&:hover": { color: "info.main" },
                                          }}
                                        >
                                          <Edit2 size={18} strokeWidth={1.8} />
                                        </IconButton>
                                        <IconButton
                                          onClick={() => handleDeleteJob(index)}
                                          size="small"
                                          sx={{
                                            color: "grey.600",
                                            "&:hover": { color: "error.main" },
                                          }}
                                        >
                                          <Trash2 size={18} strokeWidth={1.8} />
                                        </IconButton>
                                      </MDBox>
                                    </MDBox>

                                    <MDBox display="flex" flexDirection="column" gap={2}>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Job Title:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.type || "N/A"}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Number of Guards:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.numberOfGuards || "N/A"}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Start Date & Time:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {formatDateTime(job.startDate, job.startTime)}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          End Date & Time:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {formatDateTime(job.endDate, job.endTime)}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Location:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.marker?.title || "No location set"} (Radius:{" "}
                                          {job.searchRadius || 10} miles)
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                      >
                                        <MDTypography variant="body2" color="text">
                                          Description:{" "}
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.description?.substring(0, 100) || "No description"}
                                          {job.description?.length > 100 ? "..." : ""}
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
                                          $
                                          {calculateJobCost(
                                            job.startDate,
                                            job.startTime,
                                            job.endDate,
                                            job.endTime,
                                            job.numberOfGuards
                                          ).total.toFixed(2)}
                                        </MDTypography>
                                      </MDBox>
                                    </MDBox>
                                  </MDBox>
                                </Card>
                              ))}
                            </MDBox>
                          </MDBox>
                        )}
                        <Card sx={{ padding: 3, backgroundColor: "#fffdf8ff" }}>
                          <MDTypography variant="h4" fontWeight="medium" mb={3}>
                            Job Information
                          </MDTypography>
                          <MDBox display="flex" flexDirection="column" gap={2}>
                            <FormControl
                              fullWidth
                              variant="outlined"
                              error={touched.type && Boolean(errors.type)}
                            >
                              <InputLabel id="job-type-label">Job Category</InputLabel>
                              <Select
                                labelId="job-type-label"
                                label="Job Category"
                                name="type"
                                value={values.type}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                sx={{ height: "50px" }}
                              >
                                <MenuItem value="">
                                  <em>Select Job Type</em>
                                </MenuItem>
                                <MenuItem value="Event security">Event Security</MenuItem>
                                <MenuItem value="Residential security">
                                  Residential Security
                                </MenuItem>
                                <MenuItem value="Corporate security">Corporate Security</MenuItem>
                                <MenuItem value="Personal bodyguard">Personal Bodyguard</MenuItem>
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
                              label="Additional Details"
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
                            {/* Add this after the Additional Details TextField */}
                            <MDBox>
                              <MDTypography variant="h6" mb={1}>
                                Job Instructions (Optional)
                              </MDTypography>
                              <MDTypography variant="caption" color="text" mb={2} display="block">
                                Upload a PDF document with detailed job instructions
                              </MDTypography>

                              <MDBox display="flex" alignItems="center" gap={2}>
                                <input
                                  accept="application/pdf"
                                  style={{ display: "none" }}
                                  id="pdf-upload-button"
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, setFieldValue)}
                                  disabled={uploadingFile}
                                  key={values.job_instructions || "empty"}
                                />
                                <label htmlFor="pdf-upload-button">
                                  <MDButton
                                    variant="outlined"
                                    color="info"
                                    component="span"
                                    disabled={uploadingFile}
                                  >
                                    {uploadingFile
                                      ? "Uploading..."
                                      : values.job_instructions
                                      ? "Change PDF"
                                      : "Upload PDF"}
                                  </MDButton>
                                </label>

                                {values.job_instructions && (
                                  <>
                                    <MDTypography variant="caption" color="success">
                                      ✓ File uploaded successfully
                                    </MDTypography>
                                    <MDButton
                                      variant="text"
                                      color="error"
                                      size="small"
                                      onClick={() => setFieldValue("job_instructions", "")}
                                    >
                                      Remove
                                    </MDButton>
                                  </>
                                )}
                              </MDBox>
                            </MDBox>
                          </MDBox>
                        </Card>
                        <MDBox mt={5}>
                          <Card sx={{ padding: 3, backgroundColor: "#fffdf8ff" }}>
                            <Grid container spacing={3} alignItems="flex-start">
                              {/* LEFT COLUMN */}
                              <Grid item xs={12} md={4}>
                                <Grid container spacing={3} display="flex" flexDirection="column">
                                  <Grid item xs={12} md={12}>
                                    <MDTypography variant="h6" mb={2}>
                                      Start Time
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
                                  <Grid item xs={12} md={12}>
                                    <MDTypography variant="h6" mb={2}>
                                      End Time
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
                                <MDBox mt={3}>
                                  <MDTypography variant="h6" mb={2}>
                                    Number of Guards
                                  </MDTypography>
                                  <MDBox
                                    display="flex"
                                    gap={2}
                                    // alignItems="center"
                                    flexDirection="column"
                                  >
                                    {/* Number of Guards Input */}

                                    <TextField
                                      type="number"
                                      label="Guards"
                                      value={values.numberOfGuards}
                                      onChange={(e) =>
                                        setFieldValue(
                                          "numberOfGuards",
                                          Math.max(1, Number(e.target.value) || 1)
                                        )
                                      }
                                      inputProps={{
                                        min: 1,
                                        style: { textAlign: "center" },
                                      }}
                                      sx={{
                                        width: 120,
                                        "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                          {
                                            WebkitAppearance: "none",
                                            margin: 0,
                                          },
                                        "& input[type=number]": {
                                          MozAppearance: "textfield",
                                        },
                                      }}
                                    />

                                    {/* Total Hours */}
                                    <MDTypography variant="h6" color="text">
                                      Total hours:{" "}
                                      {calculateShiftHours(
                                        values.startDate,
                                        values.startTime,
                                        values.endDate,
                                        values.endTime
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

                                {/* Validation BELOW title */}
                                {touched.marker && errors.marker && (
                                  <MDTypography variant="caption" color="error">
                                    {typeof errors.marker === "string"
                                      ? errors.marker
                                      : "location is required"}
                                  </MDTypography>
                                )}
                              </Grid>

                              {/* RIGHT COLUMN */}
                              <Grid item xs={12} md={8}>
                                <MDBox
                                  sx={{
                                    height: 400,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border:
                                      touched.marker && errors.marker
                                        ? "2px solid #f44336"
                                        : "1px solid #ffffffff",
                                  }}
                                >
                                  <SelectJobLocation
                                    marker={values.marker}
                                    setMarker={(marker) => setFieldValue("marker", marker)}
                                  />
                                </MDBox>
                              </Grid>
                            </Grid>
                          </Card>
                        </MDBox>
                        {/* <MDBox mt={3}>
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
                        </MDBox> */}
                      </MDBox>
                    )}

                    {/* Step 2: Payment */}
                    {activeStep === 1 && (
                      <MDBox>
                        <MDTypography variant="h4" fontWeight="medium" mb={3}>
                          Review & Confirm
                        </MDTypography>
                        {/* All Jobs - Unified Detailed Display */}
                        <Grid container spacing={3}>
                          {/* ================= LEFT COLUMN ================= */}
                          <Grid item xs={12} md={8}>
                            <MDBox display="flex" flexDirection="column" gap={3} mb={4}>
                              {/* Queued Jobs */}
                              {jobsQueue.map((job, index) => (
                                <Card
                                  key={index}
                                  sx={{
                                    background: "linear-gradient(to right, #E3F2FD, #C5CAE9)",
                                  }}
                                >
                                  <MDBox p={3}>
                                    <MDBox
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                      mb={2}
                                    >
                                      <MDTypography variant="h6" fontWeight="medium">
                                        Job {index + 1} - {job.type}
                                      </MDTypography>
                                      <MDBox display="flex" gap={1}>
                                        <IconButton
                                          onClick={() => {
                                            handleEditJob(index, setFieldValue);
                                            setActiveStep(0);
                                          }}
                                          size="small"
                                          sx={{
                                            color: "grey.600",
                                            "&:hover": { color: "info.main" },
                                          }}
                                        >
                                          <Edit2 size={18} strokeWidth={1.8} />
                                        </IconButton>
                                        <IconButton
                                          onClick={() => handleDeleteJob(index)}
                                          size="small"
                                          sx={{
                                            color: "grey.600",
                                            "&:hover": { color: "error.main" },
                                          }}
                                        >
                                          <Trash2 size={18} strokeWidth={1.8} />
                                        </IconButton>
                                      </MDBox>
                                    </MDBox>

                                    <MDBox display="flex" flexDirection="column" gap={2}>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Job Title:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.type}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Number of Guards:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.numberOfGuards}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Start Date & Time:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {formatDateTime(job.startDate, job.startTime)}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          End Date & Time:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {formatDateTime(job.endDate, job.endTime)}
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          Location:
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          {job.marker.title} (Radius: {job.searchRadius} miles)
                                        </MDTypography>
                                      </MDBox>
                                      <MDBox
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                      >
                                        <MDTypography variant="body2" color="text">
                                          Description:
                                        </MDTypography>
                                        <MDTypography
                                          variant="body2"
                                          fontWeight="medium"
                                          sx={{ maxWidth: "70%", textAlign: "right" }}
                                        >
                                          {job.description || "No description provided"}
                                        </MDTypography>
                                      </MDBox>

                                      {/* Cost Breakdown */}
                                      <MDBox
                                        mt={2}
                                        pt={2}
                                        sx={{ borderTop: "1px solid", borderColor: "grey.300" }}
                                      >
                                        <MDTypography
                                          variant="body2"
                                          fontWeight="medium"
                                          color="text"
                                          mb={1}
                                        >
                                          Rate Breakdown:
                                        </MDTypography>
                                        {calculateJobCost(
                                          values.startDate,
                                          values.startTime,
                                          values.endDate,
                                          values.endTime,
                                          values.numberOfGuards
                                        ).breakdown.map((item, idx) => (
                                          <MDBox
                                            key={idx}
                                            display="flex"
                                            justifyContent="space-between"
                                            mb={0.5}
                                          >
                                            <MDTypography variant="caption" color="text">
                                              {item.type}: {item.hours.toFixed(2)}h × ${item.rate}/h
                                              × {values.numberOfGuards} guard
                                              {values.numberOfGuards > 1 ? "s" : ""}
                                            </MDTypography>
                                            <MDTypography variant="caption" fontWeight="medium">
                                              ${item.cost.toFixed(2)}
                                            </MDTypography>
                                          </MDBox>
                                        ))}
                                        <MDBox display="flex" justifyContent="space-between" mt={1}>
                                          <MDTypography variant="caption" color="text">
                                            Subtotal:
                                          </MDTypography>
                                          <MDTypography variant="caption" fontWeight="medium">
                                            $
                                            {calculateJobCost(
                                              values.startDate,
                                              values.startTime,
                                              values.endDate,
                                              values.endTime,
                                              values.numberOfGuards
                                            ).subtotal.toFixed(2)}
                                          </MDTypography>
                                        </MDBox>
                                      </MDBox>

                                      <MDBox display="flex" justifyContent="space-between">
                                        <MDTypography variant="body2" color="text">
                                          GST (10%):
                                        </MDTypography>
                                        <MDTypography variant="body2" fontWeight="medium">
                                          $
                                          {calculateJobCost(
                                            values.startDate,
                                            values.startTime,
                                            values.endDate,
                                            values.endTime,
                                            values.numberOfGuards
                                          ).gst.toFixed(2)}
                                        </MDTypography>
                                      </MDBox>

                                      <MDBox
                                        display="flex"
                                        justifyContent="space-between"
                                        pt={2}
                                        sx={{ borderTop: "1px solid", borderColor: "grey.400" }}
                                      >
                                        <MDTypography variant="h6" color="text">
                                          Job Amount:
                                        </MDTypography>
                                        <MDTypography variant="h5" color="info">
                                          $
                                          {calculateJobCost(
                                            values.startDate,
                                            values.startTime,
                                            values.endDate,
                                            values.endTime,
                                            values.numberOfGuards
                                          ).total.toFixed(2)}
                                        </MDTypography>
                                      </MDBox>
                                    </MDBox>
                                  </MDBox>
                                </Card>
                              ))}

                              {/* Current Job Being Added */}
                              <Card
                                sx={{
                                  background: "linear-gradient(to right, #E3F2FD, #C5CAE9)",
                                  border: "2px dashed",
                                  borderColor: "info.main",
                                }}
                              >
                                <MDBox p={3}>
                                  <MDBox
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    mb={2}
                                  >
                                    <MDTypography variant="h6" fontWeight="medium" color="info">
                                      Current Job (Being Added)
                                    </MDTypography>
                                    <IconButton
                                      onClick={() => setActiveStep(0)}
                                      size="small"
                                      sx={{
                                        color: "grey.600",
                                        "&:hover": { color: "info.main" },
                                      }}
                                    >
                                      <Edit2 size={18} strokeWidth={1.8} />
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
                                        Start Date & Time:
                                      </MDTypography>
                                      <MDTypography variant="body2" fontWeight="medium">
                                        {formatDateTime(values.startDate, values.startTime)}
                                      </MDTypography>
                                    </MDBox>

                                    <MDBox display="flex" justifyContent="space-between">
                                      <MDTypography variant="body2" color="text">
                                        End Date & Time:
                                      </MDTypography>
                                      <MDTypography variant="body2" fontWeight="medium">
                                        {formatDateTime(values.endDate, values.endTime)}
                                      </MDTypography>
                                    </MDBox>

                                    <MDBox display="flex" justifyContent="space-between">
                                      <MDTypography variant="body2" color="text">
                                        Location:
                                      </MDTypography>
                                      <MDTypography variant="body2" fontWeight="medium">
                                        {values.marker?.title || "N/A"} (Radius:{" "}
                                        {values.searchRadius} miles)
                                      </MDTypography>
                                    </MDBox>

                                    <MDBox
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="flex-start"
                                    >
                                      <MDTypography variant="body2" color="text">
                                        Description:
                                      </MDTypography>
                                      <MDTypography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{ maxWidth: "70%", textAlign: "right" }}
                                      >
                                        {values.description || "No description provided"}
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
                                        $
                                        {calculateJobCost(
                                          values.startDate,
                                          values.startTime,
                                          values.endDate,
                                          values.endTime,
                                          values.numberOfGuards
                                        ).total.toFixed(2)}
                                      </MDTypography>
                                    </MDBox>
                                  </MDBox>
                                </MDBox>
                              </Card>
                            </MDBox>

                            <Card
                              sx={{
                                backgroundColor: "success.light",
                                border: "1px solid",
                                borderColor: "success.main",
                                mb: 3,
                              }}
                            >
                              <MDBox p={3}>
                                <MDBox
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <MDTypography variant="h5" fontWeight="medium">
                                    Total Amount ({jobsQueue.length + 1} Job
                                    {jobsQueue.length + 1 !== 1 ? "s" : ""})
                                  </MDTypography>
                                  <MDTypography variant="h3" color="success" fontWeight="bold">
                                    $
                                    {[
                                      ...jobsQueue,
                                      {
                                        startDate: values.startDate,
                                        startTime: values.startTime,
                                        endDate: values.endDate,
                                        endTime: values.endTime,
                                        numberOfGuards: values.numberOfGuards || 1,
                                      },
                                    ]
                                      .reduce(
                                        (sum, job) =>
                                          sum +
                                          calculateJobCost(
                                            job.startDate,
                                            job.startTime,
                                            job.endDate,
                                            job.endTime,
                                            job.numberOfGuards || 1
                                          ).total,
                                        0
                                      )
                                      .toFixed(2)}
                                  </MDTypography>
                                </MDBox>
                              </MDBox>
                            </Card>
                          </Grid>

                          {/* RIGHT SIDE — PAYMENT DETAILS */}
                          <Grid item xs={12} md={4}>
                            <Card
                              sx={{
                                backgroundColor: "background.paper",
                                border: "1px solid",
                                borderColor: "grey.300",
                                position: "sticky",
                                top: 100,
                              }}
                            >
                              <MDBox p={3}>
                                <MDTypography variant="h5" fontWeight="medium" mb={2}>
                                  Payment Details
                                </MDTypography>

                                <MDBox display="flex" flexDirection="column" gap={3}>
                                  <TextField
                                    label="Cardholder Name"
                                    fullWidth
                                    placeholder="John Doe"
                                  />

                                  <TextField
                                    label="Card Number"
                                    fullWidth
                                    placeholder="1234 5678 9012 3456"
                                    inputProps={{ maxLength: 19 }}
                                  />

                                  <MDBox display="flex" gap={2}>
                                    <TextField
                                      label="Expiry Date"
                                      placeholder="MM/YY"
                                      fullWidth
                                      inputProps={{ maxLength: 5 }}
                                    />

                                    <TextField
                                      label="CVV"
                                      placeholder="123"
                                      fullWidth
                                      type="password"
                                      inputProps={{ maxLength: 4 }}
                                    />
                                  </MDBox>

                                  <MDTypography variant="caption" color="text">
                                    Your payment is secure and encrypted. Funds are held in escrow
                                    until the job is completed.
                                  </MDTypography>

                                  <MDButton color="info" fullWidth size="large">
                                    Pay Now
                                  </MDButton>
                                </MDBox>
                              </MDBox>
                            </Card>
                          </Grid>
                        </Grid>

                        {/* Terms and Conditions */}
                        <MDBox mb={3}>
                          <MDTypography variant="h6" gutterBottom>
                            Terms and Conditions
                          </MDTypography>
                          <Box
                            sx={{
                              maxHeight: 250,
                              overflowY: "auto",
                              borderRadius: "8px",
                              p: 2,
                              border: "1px solid",
                              borderColor: "grey.300",
                              backgroundColor: "background.paper",
                            }}
                          >
                            <MDTypography variant="body2" paragraph>
                              Welcome to our on-demand security guard booking platform (&quot;the
                              Platform&quot;), a service designed to connect clients and licensed
                              security guards in Australia. By using this Platform, you agree to the
                              following Terms and Conditions (&quot;Terms&quot;). Please read them
                              carefully before proceeding with any booking or payment.
                            </MDTypography>

                            <MDTypography variant="subtitle2" fontWeight="medium">
                              1. Secure Payment & Dispute Policy
                            </MDTypography>
                            <MDTypography variant="body2" paragraph>
                              • All client payments are securely held in escrow until the booked job
                              is completed and approved by the client.
                              <br />• Once a job is marked complete and approved, funds will be
                              released to the assigned guard.
                              <br />• If an issue arises, clients may raise a dispute before the
                              release of funds.
                              <br />• In the event of a dispute, payments may be temporarily held
                              while the issue is reviewed by our support team.
                            </MDTypography>

                            <MDTypography variant="subtitle2" fontWeight="medium">
                              4. Booking & Matching Process
                            </MDTypography>
                            <MDTypography variant="body2" paragraph>
                              • Once a guard accepts, both parties receive each other&apos;s details
                              including name, license number, and contact information.
                            </MDTypography>

                            <MDTypography variant="subtitle2" fontWeight="medium">
                              9. Acceptance
                            </MDTypography>
                            <MDTypography variant="body2" paragraph>
                              By checking the agreement box and continuing to payment, you confirm
                              that you have read, understood, and agreed to these Terms and
                              Conditions.
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
                                  style={{
                                    color: "#1976d2",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Terms and Conditions
                                </span>
                                .
                              </MDTypography>
                            }
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
                          Ready to Post!
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
                              handleMakeAnotherJob(
                                values,
                                resetForm,
                                validateForm,
                                setTouched,
                                setFieldValue
                              )
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
                            disabled={activeStep === 1 && !agreeToTerms}
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
          </MDBox>
        )}
      </Formik>
    </DashboardLayout>
  );
};

export default CreateJobPage;
