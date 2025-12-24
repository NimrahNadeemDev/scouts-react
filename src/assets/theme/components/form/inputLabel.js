// Material Dashboard 2 React Base Styles
import colors from "assets/theme/base/colors";
import typography from "assets/theme/base/typography";

const { text, info } = colors;
const { size } = typography;

const inputLabel = {
  styleOverrides: {
    root: {
      fontSize: size.sm,
      color: text.main,
      lineHeight: 1.2,

      "&.Mui-focused": {
        color: info.main,
      },

      "&.MuiInputLabel-shrink": {
        fontSize: size.md,
        lineHeight: 1.4,
        transform: "translate(14px, -9px) scale(0.75)",
      },
    },

    sizeSmall: {
      fontSize: size.xs,
      lineHeight: 1.4,

      "&.MuiInputLabel-shrink": {
        fontSize: size.sm,
        transform: "translate(14px, -6px) scale(0.75)",
      },
    },
  },
};

export default inputLabel;
