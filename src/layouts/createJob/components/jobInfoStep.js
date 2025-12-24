import React from "react";
import PropTypes from "prop-types";
import { Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

function JobInfoStep({ values, errors, touched, handleChange, handleBlur, setFieldValue }) {
  return (
    <MDBox>
      <MDTypography variant="h6" fontWeight="bold" mb={3} color="dark">
        Job Information
      </MDTypography>

      <Grid container spacing={2}>
        {/* Job Type */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="text"
            label="Job Type"
            fullWidth
            name="type"
            value={values.type || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.type && Boolean(errors.type)}
            helperText={touched.type && errors.type}
          />
        </Grid>

        {/* Job Title */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="text"
            label="Job Title"
            fullWidth
            name="title"
            value={values.title || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.title && Boolean(errors.title)}
            helperText={touched.title && errors.title}
          />
        </Grid>

        {/* Description */}
        <Grid item xs={12}>
          <MDInput
            type="text"
            label="Description"
            fullWidth
            multiline
            rows={3}
            name="description"
            value={values.description || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12}>
          <MDInput
            type="text"
            label="Location"
            fullWidth
            name="location"
            value={values.location || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.location && Boolean(errors.location)}
            helperText={touched.location && errors.location}
          />
        </Grid>

        {/* Start Date */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="date"
            label="Start Date"
            fullWidth
            name="startDate"
            value={values.startDate ? values.startDate.toISOString().split("T")[0] : ""}
            onChange={(e) => setFieldValue("startDate", new Date(e.target.value))}
            onBlur={handleBlur}
            error={touched.startDate && Boolean(errors.startDate)}
            helperText={touched.startDate && errors.startDate}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Start Time */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="time"
            label="Start Time"
            fullWidth
            name="startTime"
            value={values.startTime || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.startTime && Boolean(errors.startTime)}
            helperText={touched.startTime && errors.startTime}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* End Date */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="date"
            label="End Date"
            fullWidth
            name="endDate"
            value={values.endDate ? values.endDate.toISOString().split("T")[0] : ""}
            onChange={(e) => setFieldValue("endDate", new Date(e.target.value))}
            onBlur={handleBlur}
            error={touched.endDate && Boolean(errors.endDate)}
            helperText={touched.endDate && errors.endDate}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* End Time */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="time"
            label="End Time"
            fullWidth
            name="endTime"
            value={values.endTime || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.endTime && Boolean(errors.endTime)}
            helperText={touched.endTime && errors.endTime}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Salary */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="number"
            label="Hourly Rate ($)"
            fullWidth
            name="salary"
            value={values.salary || 0}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.salary && Boolean(errors.salary)}
            helperText={touched.salary && errors.salary}
          />
        </Grid>

        {/* Number of Guards */}
        <Grid item xs={12} sm={6}>
          <MDInput
            type="number"
            label="Number of Guards Required"
            fullWidth
            name="numberOfGuards"
            value={values.numberOfGuards || 1}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.numberOfGuards && Boolean(errors.numberOfGuards)}
            helperText={touched.numberOfGuards && errors.numberOfGuards}
          />
        </Grid>
      </Grid>
    </MDBox>
  );
}

JobInfoStep.propTypes = {
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
};

export default JobInfoStep;
