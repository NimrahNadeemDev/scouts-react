import colors from "assets/theme/base/colors";

const { transparent } = colors;

const textField = {
  styleOverrides: {
    root: {
      backgroundColor: transparent.main,
      // Ensure hover and focus states stay consistent
      "&:hover": {
        backgroundColor: transparent.main,
      },
      "&.Mui-focused": {
        backgroundColor: transparent.main,
      },
    },
    input: {
      backgroundColor: transparent.main,
    },
  },
};

export default textField;
