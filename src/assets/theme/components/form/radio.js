import borders from "assets/theme/base/borders";
import colors from "assets/theme/base/colors";
import pxToRem from "assets/theme/functions/pxToRem";
import linearGradient from "assets/theme/functions/linearGradient";

const { borderWidth, borderColor } = borders;
const { transparent, info } = colors;

const radio = {
  styleOverrides: {
    root: {
      "&:hover": {
        backgroundColor: transparent.main,
      },

      "&.Mui-focusVisible": {
        outline: `${borderWidth[2]} solid ${info.main}`,
        outlineOffset: pxToRem(2),
      },
    },

    icon: {
      width: pxToRem(20),
      height: pxToRem(20),
      borderRadius: "50%",
      border: `${borderWidth[1]} solid ${borderColor}`,
      backgroundColor: transparent.main,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",

      "&::after": {
        content: '""',
        width: pxToRem(14),
        height: pxToRem(14),
        borderRadius: "50%",
        backgroundImage: linearGradient(info.main, info.main),
        opacity: 0,
        transition: "opacity 250ms ease-in-out",
        position: "absolute",
      },
    },

    checkedIcon: {
      "&::after": {
        opacity: 1,
      },
      borderColor: info.main,
    },
  },
};

export default radio;
