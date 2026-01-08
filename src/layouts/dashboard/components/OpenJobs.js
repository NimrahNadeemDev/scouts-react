import React, { useEffect, useState } from "react";
import axiosInstance from "config/axiosConfig";

// Dashboard layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Material Dashboard components
import Tooltip from "@mui/material/Tooltip";
import MDAvatar from "components/MDAvatar";
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
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  Alarm as ClockIcon,
} from "@mui/icons-material";
import { margin } from "@mui/system";

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
const avatars = (members) =>
  members.map(([image, name]) => (
    <Tooltip key={name} title={name} placeholder="bottom">
      <MDAvatar
        src={image}
        alt="name"
        size="xs"
        sx={{
          border: ({ borders: { borderWidth }, palette: { white } }) =>
            `${borderWidth[2]} solid ${white.main}`,
          cursor: "pointer",
          position: "relative",

          "&:not(:first-of-type)": {
            ml: -1.25,
          },

          "&:hover, &:focus": {
            zIndex: "10",
          },
        }}
      />
    </Tooltip>
  ));

function OpenJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Start Date (Newest)");
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1); // Current page
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

  useEffect(() => {
    let result = [...jobs];

    // Get today's date (YYYY-MM-DD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ ONLY today's + pending jobs
    result = result.filter((job) => {
      if (!job.start || !job.job_status) return false;

      const jobDate = new Date(job.start);
      jobDate.setHours(0, 0, 0, 0);

      return jobDate.getTime() === today.getTime() && job.job_status.toLowerCase() === "pending";
    });

    // Sorting (keep existing behavior)
    result.sort((a, b) => new Date(b.start) - new Date(a.start));

    setFilteredJobs(result);
    setPage(1);
  }, [jobs, sortBy]);

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

  const paginatedJobs = filteredJobs.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <MDBox px={3} pt={2}>
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
              No jobs found
            </MDTypography>
          </MDBox>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedJobs.map((job, index) => (
              <Grid item xs={12} key={index}>
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
                          ID: #{(page - 1) * rowsPerPage + index + 1}
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
                    </Grid>
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
          <MDBox display="flex" justifyContent="center" mt={3}>
            <MDPagination
              count={Math.ceil(filteredJobs.length / rowsPerPage)}
              page={page}
              onChange={handleChangePage}
              variant="outlined"
              color="info"
            />
          </MDBox>
        </>
      )}
    </MDBox>
  );
}
export default OpenJobs;
