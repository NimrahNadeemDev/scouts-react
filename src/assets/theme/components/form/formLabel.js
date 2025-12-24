// assets/theme/components/formLabel.js
import colors from "assets/theme/base/colors";

const { text, error, info } = colors;

const formLabel = {
  styleOverrides: {
    root: {
      color: text.main,

      "&.Mui-focused": {
        color: info.main,
      },

      "&.Mui-error": {
        color: error.main,
      },

      "&.Mui-disabled": {
        color: text.disabled,
      },
    },
  },
};

export default formLabel;
