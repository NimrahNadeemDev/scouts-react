import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";
import OpenJobs from "./components/OpenJobs";
import useCustomer from "hooks/useCustomer";
import axiosInstance from "config/axiosConfig";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;
  const { user } = useCustomer();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Fetch jobs data for the dashboard
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const customerId = user?.customer_id || user?.id;
        if (!customerId) return;

        const res = await axiosInstance.post("/job/history", { customer_id: customerId });
        const jobsData = res.data?.data || res.data || [];

        // Sort by newest first (LIFO)
        jobsData.sort((a, b) => new Date(b.start) - new Date(a.start));

        setJobs(jobsData);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [user]);

  // Helper functions
  const getCurrentMonthJobsCountByStatus = (status) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return jobs.filter((job) => {
      if (!job.start || !job.job_status) return false;
      const jobDate = new Date(job.start);
      return (
        jobDate.getMonth() === currentMonth &&
        jobDate.getFullYear() === currentYear &&
        job.job_status.toLowerCase() === status.toLowerCase()
      );
    }).length;
  };

  const getJobsCountByStatus = (status) =>
    jobs.filter((job) => job.job_status?.toLowerCase() === status.toLowerCase()).length;

  const getTotalJobsCount = () => jobs.length;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Jobs Summary Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Ongoing Jobs"
                count={getCurrentMonthJobsCountByStatus("pending")}
                loading={loadingJobs}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Confirmed Jobs"
                count={getCurrentMonthJobsCountByStatus("confirmed")}
                loading={loadingJobs}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Completed Jobs"
                count={getJobsCountByStatus("completed")}
                loading={loadingJobs}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Charts */}
        {/* <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Website Views"
                  description="Last Campaign Performance"
                  date="campaign sent 2 days ago"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Daily Sales"
                  description={
                    <>
                      (<strong>+15%</strong>) increase in today sales.
                    </>
                  }
                  date="updated 4 min ago"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Completed Tasks"
                  description="Last Campaign Performance"
                  date="just updated"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox> */}

        {/* Open Jobs Table and Orders Overview */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <OpenJobs showOnlyOpen jobs={jobs} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
