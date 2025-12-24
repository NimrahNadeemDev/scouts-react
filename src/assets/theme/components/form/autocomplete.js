// Material Dashboard 2 React base styles
import boxShadows from "assets/theme/base/boxShadows";
import typography from "assets/theme/base/typography";
import colors from "assets/theme/base/colors";
import borders from "assets/theme/base/borders";

// Helper functions
import pxToRem from "assets/theme/functions/pxToRem";

const { lg } = boxShadows;
const { size } = typography;
const { text, white, transparent, light, dark, gradients } = colors;
const { borderRadius } = borders;

const autocomplete = {
  styleOverrides: {
    popper: {
      boxShadow: lg,
      padding: pxToRem(8),
      fontSize: size.sm,
      color: text.main,
      backgroundColor: white.main,
      borderRadius: borderRadius.md,
      zIndex: 1300,
    },

    paper: {
      boxShadow: "none",
      backgroundColor: transparent.main,
    },

    option: {
      padding: `${pxToRem(6)} ${pxToRem(16)}`,
      borderRadius: borderRadius.md,
      fontSize: size.sm,
      color: text.main,
      transition: "background-color 200ms ease",

      "&:hover": {
        backgroundColor: light.main,
        color: dark.main,
      },

      "&.Mui-selected": {
        backgroundColor: light.main,
        color: dark.main,
      },

      "&.Mui-selected:hover": {
        backgroundColor: light.main,
      },
    },

    noOptions: {
      fontSize: size.sm,
      color: text.main,
    },

    groupLabel: {
      color: dark.main,
      fontWeight: 600,
    },

    loading: {
      fontSize: size.sm,
      color: text.main,
    },

    tag: {
      backgroundColor: gradients.dark.state,
      color: white.main,
      borderRadius: borderRadius.sm,

      "& .MuiChip-label": {
        padding: `0 ${pxToRem(8)}`,
      },

      "& .MuiSvgIcon-root": {
        color: white.main,
      },
    },
  },
};

export default autocomplete;
