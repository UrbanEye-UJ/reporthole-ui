import type { ReactNode } from "react";

import {
  Paper,
  Typography,
  Box,
} from "@mui/material";

interface PanelProps {
  title?: string;
  children: ReactNode;
  height?: number | string;
  padding?: number;
}

const Panel = ({
  title,
  children,
  height = "100%",
  padding = 3,
}: PanelProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: padding,
        height,
        borderRadius: 4,

        background: "rgba(17, 25, 40, 0.72)",

        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",

        border: "1px solid rgba(255,255,255,.08)",

        transition: "all .25s ease",

        overflow: "hidden",

        "&:hover": {
          borderColor: "primary.main",

          boxShadow:
            "0 10px 30px rgba(59,130,246,.18)",

          transform: "translateY(-2px)",
        },
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            fontWeight: 700,
            letterSpacing: ".3px",
          }}
        >
          {title}
        </Typography>
      )}

      <Box
        sx={{
          height: title
            ? "calc(100% - 42px)"
            : "100%",
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default Panel;