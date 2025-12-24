// assets/theme/components/checkbox.js
import borders from "assets/theme/base/borders";
import colors from "assets/theme/base/colors";
import pxToRem from "assets/theme/functions/pxToRem";
import linearGradient from "assets/theme/functions/linearGradient";

const { borderWidth, borderColor } = borders;
const { transparent, info } = colors;

const checkbox = {
  styleOverrides: {
    root: {
      "& .MuiSvgIcon-root": {
        width: pxToRem(20),
        height: pxToRem(20),
        color: transparent.main,
        border: `${borderWidth[1]} solid ${borderColor}`,
        borderRadius: pxToRem(5.6),
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      },
      "&:hover": {
        backgroundColor: transparent.main,
      },
      "&.Mui-focusVisible": {
        border: `${borderWidth[2]} solid ${info.main} !important`,
      },
    },

    colorPrimary: {
      "&.Mui-checked": {
        color: info.main,
        "& .MuiSvgIcon-root": {
          borderColor: info.main,
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -1 22 22'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M6 10l3 3l6-6'/%3e%3c/svg%3e"), ${linearGradient(
            info.main,
            info.main
          )}`,
        },
      },
    },

    colorSecondary: {
      "&.Mui-checked": {
        color: info.main,
        "& .MuiSvgIcon-root": {
          borderColor: info.main,
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 -1 22 22'%3e%3cpath fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M6 10l3 3l6-6'/%3e%3c/svg%3e"), ${linearGradient(
            info.main,
            info.main
          )}`,
        },
      },
    },
  },
};

export default checkbox;
