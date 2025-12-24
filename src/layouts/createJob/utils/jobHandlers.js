export const handleJobSubmit = async (
  values,
  formikBag,
  jobsQueue,
  setLoading,
  showSnackbar,
  navigate
) => {
  try {
    setLoading(true);
    // Simulate API call
    console.log("Submitting jobs:", jobsQueue);

    // In a real app, you would send this to your backend
    // const response = await api.createJobs(jobsQueue);

    showSnackbar("Jobs created successfully!", "success");
    formikBag.resetForm();
    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  } catch (error) {
    console.error("Error submitting jobs:", error);
    showSnackbar(error.message || "Failed to create jobs", "error");
  } finally {
    setLoading(false);
  }
};

export const handleMakeAnotherJob = (
  values,
  resetForm,
  validateForm,
  setTouched,
  activeStep,
  setJobsQueue,
  setActiveStep,
  showSnackbar
) => {
  // Add current job to queue
  setJobsQueue((prev) => [...prev, values]);

  // Reset form for next job
  resetForm();

  // Reset to first step
  setActiveStep(0);

  showSnackbar("Job added to queue. Fill in the next job details.", "success");
};

export const handleDeleteCurrentJob = (
  resetForm,
  values,
  jobsQueue,
  setJobsQueue,
  setJobDetailsModal,
  showSnackbar
) => {
  // Remove the current job from queue if it exists
  const updatedQueue = jobsQueue.filter((job) => job !== values);
  setJobsQueue(updatedQueue);

  // Close modal
  setJobDetailsModal(false);

  // Reset form
  resetForm();

  showSnackbar("Job deleted from queue", "info");
};
