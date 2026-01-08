import React, { useEffect, useState } from "react";
import axiosInstance from "config/axiosConfig";

// Dashboard layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDBadge from "components/MDBadge";
import MDPagination from "components/MDPagination";

// MUI components
import {
  Card,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Alarm as ClockIcon,
} from "@mui/icons-material";

/**
 * Get logged-in customer ID safely
 */
const getCustomerId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.customer_id || user?.id || null;
  } catch {
    return null;
  }
};

function JobsHistory() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Start Date (Newest)");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const customerId = getCustomerId();

    if (!customerId) {
      console.error("Customer ID not found");
      setLoading(false);
      return;
    }

    axiosInstance
      .post("/job/history", { customer_id: customerId })
      .then((res) => {
        const jobsData = res.data?.data || res.data || [];
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      })
      .catch((err) => {
        console.error("Failed to fetch job history:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...jobs];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (job) =>
          job.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.id?.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter((job) => job.job_status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy.includes("Newest")) {
        return new Date(b.start) - new Date(a.start);
      } else if (sortBy.includes("Oldest")) {
        return new Date(a.start) - new Date(b.start);
      }
      return 0;
    });

    setFilteredJobs(result);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, sortBy, jobs]);

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "completed":
        return "info";
      default:
        return "secondary";
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedJob(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const startIdx = (page - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const paginatedJobs = filteredJobs.slice(startIdx, endIdx);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox px={3} pt={2}>
        {/* Header */}
        <MDBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDBox>
            <MDTypography variant="button" color="text" fontWeight="regular">
              Browse and manage all security job postings
            </MDTypography>
          </MDBox>
          <MDBadge
            variant="gradient"
            color="success"
            badgeContent={`Total Jobs: ${jobs.length}`}
            size="lg"
          />
        </MDBox>

        {/* Filters and Controls */}
        <MDBox mb={2.5}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by type, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <MDBox display="flex" justifyContent="flex-end" gap={1.5} flexWrap="wrap">
                {/* Status Filter */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    displayEmpty
                    startAdornment={
                      <InputAdornment position="start">
                        <FilterIcon fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                      "& .MuiSelect-select": {
                        py: 1,
                      },
                    }}
                  >
                    <MenuItem value="All">Status: All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>

                {/* Sort */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    displayEmpty
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon fontSize="small" />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                      "& .MuiSelect-select": {
                        py: 1,
                      },
                    }}
                  >
                    <MenuItem value="Start Date (Newest)">Start Date (Newest)</MenuItem>
                    <MenuItem value="Start Date (Oldest)">Start Date (Oldest)</MenuItem>
                  </Select>
                </FormControl>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Column Headers */}
        <Card sx={{ mb: 2, bgcolor: "success.main" }}>
          <MDBox p={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2.5}>
                <MDTypography variant="button" fontWeight="bold" color="white">
                  JOB DETAILS
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <MDTypography variant="button" fontWeight="bold" color="white">
                  LOCATION
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={2.5}>
                <MDTypography variant="button" fontWeight="bold" color="white">
                  SCHEDULE
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={2}>
                <MDTypography variant="button" fontWeight="bold" color="white">
                  HOURS
                </MDTypography>
              </Grid>
              <Grid item xs={12} md={1.5}>
                <MDTypography variant="button" fontWeight="bold" color="white">
                  STATUS
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
        </Card>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="h6" color="text">
                {searchTerm || statusFilter !== "All"
                  ? "No jobs match your search or filters."
                  : "No jobs found"}
              </MDTypography>
            </MDBox>
          </Card>
        ) : (
          <>
            <Grid container spacing={2}>
              {paginatedJobs.map((job, index) => (
                <Grid item xs={12} key={job.id || index}>
                  <Card>
                    <MDBox p={2.5}>
                      <Grid container spacing={2} alignItems="center">
                        {/* Job Details Column */}
                        <Grid item xs={12} md={2.3}>
                          <MDTypography
                            variant="caption"
                            color="text"
                            display="block"
                            mt={0.5}
                            fontWeight="bold"
                          >
                            ID: #{startIdx + index + 1}
                          </MDTypography>
                        </Grid>
                        {/* Location Column */}
                        <Grid item xs={12} md={2.5}>
                          <MDBox display="flex" alignItems="flex-start" gap={1}>
                            <MDTypography variant="caption" color="text" fontWeight="bold">
                              {job.site_name || "Location not specified"}
                            </MDTypography>
                          </MDBox>
                        </Grid>
                        {/* Schedule Column */}
                        <Grid item xs={12} md={2.5}>
                          <MDTypography variant="caption" display="block">
                            Start
                          </MDTypography>
                          <MDTypography variant="caption" display="block" fontWeight="bold">
                            {formatDate(job.start)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {formatTime(job.start)}
                          </MDTypography>
                          <MDTypography variant="caption" display="block" mt={1}>
                            End
                          </MDTypography>
                          <MDTypography variant="caption" display="block" fontWeight="bold">
                            {formatDate(job.end)}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {formatTime(job.end)}
                          </MDTypography>
                        </Grid>
                        {/* Hours Column */}
                        <Grid item xs={12} md={2.2}>
                          <MDBox display="flex" alignItems="center" gap={1}>
                            <ClockIcon fontSize="small" />
                            <MDTypography variant="h6" fontWeight="bold">
                              {job.hours || "N/A"}
                            </MDTypography>
                          </MDBox>
                        </Grid>
                        {/* Status Column */}
                        <Grid item xs={12} md={1}>
                          <MDBadge
                            variant="gradient"
                            color={statusColor(job.job_status)}
                            badgeContent={job.job_status || "Open"}
                            size="sm"
                          />
                        </Grid>
                        <Grid item xs={12} md={1.5}>
                          <MDButton
                            size="small"
                            color="info"
                            variant="outlined"
                            onClick={() => handleViewJob(job)}
                          >
                            Open
                          </MDButton>
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            <MDBox
              mt={4}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <MDTypography variant="caption" color="text">
                Showing {startIdx + 1} to {Math.min(endIdx, filteredJobs.length)} of{" "}
                {filteredJobs.length} jobs
              </MDTypography>

              <MDBox display="flex" alignItems="center" gap={2}>
                <MDTypography variant="caption" color="text">
                  Rows per page:
                </MDTypography>
                <Select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  size="small"
                  sx={{ height: 32 }}
                >
                  {[5, 10, 25, 50].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </Select>

                <MDPagination
                  count={Math.ceil(filteredJobs.length / rowsPerPage)}
                  page={page}
                  onChange={handleChangePage}
                  variant="outlined"
                  color="info"
                  showFirstButton
                  showLastButton
                />
              </MDBox>
            </MDBox>
          </>
        )}
      </MDBox>

      {/* Job Details Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5" fontWeight="bold">
              Job Details
            </MDTypography>
            <IconButton onClick={handleCloseModal} size="small">
              <CloseIcon />
            </IconButton>
          </MDBox>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedJob ? (
            <Grid container spacing={3}>
              {/* Status */}
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1} display="block" alignItems="center">
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Status
                    </MDTypography>
                    <MDBadge
                      variant="gradient"
                      color={statusColor(selectedJob.job_status)}
                      badgeContent={selectedJob.job_status || "Open"}
                      size="sm"
                    />
                  </MDBox>
                </Card>
              </Grid>

              {/* Customer Name */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Customer Name
                    </MDTypography>
                    <MDTypography variant="body2" mt={0.5}>
                      {selectedJob.customer_name || "N/A"}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              {/* Guard Assigned */}
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Guard Assigned
                    </MDTypography>
                    <MDTypography variant="body2" mt={0.5}>
                      {selectedJob.guard_id ? selectedJob.guard_name : "N/A"}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              {/* Job ID */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Job ID
                    </MDTypography>
                    <MDTypography variant="body2" mt={0.5}>
                      #{jobs.findIndex((j) => j.id === selectedJob.id) + 1}
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Location
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <LocationIcon fontSize="small" />
                      <MDTypography variant="body2">
                        {selectedJob.site_name || "Not specified"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Start Date & Time */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Start Date & Time
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <CalendarIcon fontSize="small" />
                      <MDTypography variant="body2">
                        {formatDate(selectedJob.start)} at {formatTime(selectedJob.start)}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* End Date & Time */}
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      End Date & Time
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" gap={0.5} mt={0.5}>
                      <CalendarIcon fontSize="small" />
                      <MDTypography variant="body2">
                        {formatDate(selectedJob.end)} at {formatTime(selectedJob.end)}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>

              {/* Hours */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2 }}>
                  <MDBox p={1}>
                    <MDTypography variant="button" fontWeight="bold" color="text" display="block">
                      Hours
                    </MDTypography>
                    <MDTypography variant="body2" mt={0.5}>
                      {selectedJob.hours || "N/A"} hours
                    </MDTypography>
                  </MDBox>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </Grid>
          ) : (
            <MDTypography variant="body2">No job selected.</MDTypography>
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <MDButton onClick={handleCloseModal} variant="outlined" color="secondary">
            Close
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default JobsHistory;
