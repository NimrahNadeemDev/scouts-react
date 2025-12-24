import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

function JobDetailsModal({
  open,
  onClose,
  onMakeAnother,
  onContinue,
  onDelete,
  values,
  jobsQueue,
}) {
  const totalAmount = (values.salary || 0) * (values.numberOfGuards || 1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDTypography variant="h5" fontWeight="bold" color="dark">
          Review Job Details
        </MDTypography>
      </DialogTitle>

      <DialogContent>
        {/* Job Details Summary */}
        <MDBox sx={{ mb: 3 }}>
          <Card sx={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Job Type
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold" color="dark">
                    {values.type}
                  </MDTypography>
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Title
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold" color="dark">
                    {values.title}
                  </MDTypography>
                </Grid>

                <Grid item xs={12}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Description
                  </MDTypography>
                  <MDTypography variant="body1" color="dark">
                    {values.description}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Location
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold" color="dark">
                    {values.location}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Number of Guards
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold" color="dark">
                    {values.numberOfGuards}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    Start Date & Time
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold" color="dark">
                    {new Date(values.startDate).toLocaleDateString()} {values.startTime}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <MDTypography variant="body2" color="text" opacity={0.7}>
                    End Date & Time
                  </MDTypography>
                  <MDTypography variant="body1" fontWeight="bold" color="dark">
                    {new Date(values.endDate).toLocaleDateString()} {values.endTime}
                  </MDTypography>
                </Grid>

                <Grid item xs={12} sx={{ borderTop: "2px solid #dee2e6", pt: 2 }}>
                  <MDTypography variant="body2" color="text" opacity={0.7} mb={0.5}>
                    Hourly Rate
                  </MDTypography>
                  <MDTypography variant="h6" fontWeight="bold" color="dark" mb={1.5}>
                    ${values.salary}
                  </MDTypography>
                  <MDTypography variant="body2" color="text" opacity={0.7} mb={0.5}>
                    Total Amount
                  </MDTypography>
                  <MDTypography variant="h5" fontWeight="bold" color="success">
                    ${totalAmount}
                  </MDTypography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </MDBox>

        {/* Jobs Queue Info */}
        {jobsQueue.length > 0 && (
          <MDBox sx={{ mb: 2, p: 2, backgroundColor: "#e8f5e9", borderRadius: 1 }}>
            <MDTypography variant="body2" color="success" fontWeight="bold">
              ✓ Jobs in Queue: {jobsQueue.length}
            </MDTypography>
            <MDTypography variant="caption" color="text">
              You have {jobsQueue.length} job(s) ready to submit
            </MDTypography>
          </MDBox>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <MDButton variant="gradient" color="secondary" onClick={onDelete}>
          Delete
        </MDButton>
        <MDButton variant="gradient" color="info" onClick={onMakeAnother}>
          Create Another
        </MDButton>
        <MDButton variant="gradient" color="success" onClick={onContinue}>
          Continue to Payment
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

JobDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onMakeAnother: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  values: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string,
    startDate: PropTypes.string,
    startTime: PropTypes.string,
    endDate: PropTypes.string,
    endTime: PropTypes.string,
    numberOfGuards: PropTypes.number,
    salary: PropTypes.number,
  }).isRequired,
  jobsQueue: PropTypes.arrayOf(PropTypes.object),
};

JobDetailsModal.defaultProps = {
  jobsQueue: [],
};

export default JobDetailsModal;
