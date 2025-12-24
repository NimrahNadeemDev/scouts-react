import colors from "assets/theme/base/colors";
import pxToRem from "assets/theme/functions/pxToRem";

const { transparent } = colors;

const select = {
  styleOverrides: {
    select: {
      display: "flex",
      alignItems: "center",
      padding: `0 ${pxToRem(12)}`,

      "&.Mui-selected": {
        backgroundColor: transparent.main,
      },
    },

    selectMenu: {
      background: "none",
      minHeight: "auto",
      overflow: "visible",
    },

    icon: {
      display: "none",
    },
  },
};

export default select;
