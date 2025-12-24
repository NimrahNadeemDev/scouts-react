import * as yup from "yup";

export const jobValidationSchema = yup.object().shape({
  type: yup.string().required("Job type is required"),
  title: yup.string().required("Job title is required"),
  description: yup.string(),
  location: yup.string(),
  salary: yup.number().positive("Salary must be positive"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required"),
  startTime: yup.string().required("Start time is required"),
  endTime: yup.string().required("End time is required"),
  numberOfGuards: yup
    .number()
    .positive("Number of guards must be positive")
    .required("Number of guards is required"),
  cardNumber: yup.string().required("Card number is required"),
  cardHolderName: yup.string().required("Cardholder name is required"),
  expiryDate: yup.string().required("Expiry date is required"),
  cvv: yup.string().required("CVV is required"),
});

export const getInitialValues = (day) => ({
  type: "",
  title: "",
  description: "",
  location: "",
  salary: 0,
  startDate: day ? new Date(day) : new Date(),
  endDate: day ? new Date(day) : new Date(),
  startTime: "09:00",
  endTime: "17:00",
  numberOfGuards: 1,
  cardNumber: "",
  cardHolderName: "",
  expiryDate: "",
  cvv: "",
});

export const getInitialDates = (day) => ({
  startDate: day ? new Date(day) : new Date(),
  endDate: day ? new Date(day) : new Date(),
});
