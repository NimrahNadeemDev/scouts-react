// assets/theme/components/input.js
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";

const { info, dark, inputBorderColor } = colors;
const { size } = typography;

const input = {
  styleOverrides: {
    root: {
      fontSize: size.sm,
      color: dark.main,
    },

    // Outlined input style
    outlined: {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: inputBorderColor,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: info.main,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: info.main,
      },
    },

    // Filled input style
    filled: {
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.04)",
      },
      "&.Mui-focused": {
        backgroundColor: "transparent",
      },
    },
  },
};

export default input;
