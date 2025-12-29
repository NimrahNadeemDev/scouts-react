import { useState } from "react";
import { Menu as MuiMenu, IconButton } from "@mui/material";

const ReusableDropDown = ({
  trigger,
  children,
  anchorOrigin = { vertical: "bottom", horizontal: "right" },
  transformOrigin = { vertical: "top", horizontal: "right" },
  minWidth = 250,
  onOpen,
  onClose,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (onOpen) onOpen();
  };

  const handleClose = () => {
    setAnchorEl(null);
    if (onClose) onClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
      >
        {trigger}
      </IconButton>

      <MuiMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: minWidth,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            maxHeight: "400px",
          },
        }}
      >
        {typeof children === "function" ? children(handleClose) : children}
      </MuiMenu>
    </>
  );
};

export default ReusableDropDown;
