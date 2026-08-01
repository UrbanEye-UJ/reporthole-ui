"use client";

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
        overflow: "hidden",
        transition: "all .25s ease",

        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 8px 24px rgba(37,99,235,.15)",
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
