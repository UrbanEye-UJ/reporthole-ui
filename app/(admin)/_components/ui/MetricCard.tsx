"use client";

import type { ReactNode } from "react";

import {
  Paper,
  Typography,
  Box,
  Chip,
} from "@mui/material";

import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  trend?: number;
  trendLabel?: string;
}

const MetricCard = ({
  title,
  value,
  icon,
  color = "primary.main",
  trend,
  trendLabel,
}: MetricCardProps) => {
  const positive = trend !== undefined && trend >= 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        transition: ".25s",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.main",
          boxShadow: "0 8px 24px rgba(37,99,235,.15)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 1,
              fontWeight: 700,
              color,
            }}
          >
            {value}
          </Typography>

          {trend !== undefined && (
            <Chip
              size="small"
              sx={{
                mt: 2,
                fontWeight: 600,
              }}
              color={positive ? "success" : "error"}
              icon={
                positive ? (
                  <TrendingUpRoundedIcon />
                ) : (
                  <TrendingDownRoundedIcon />
                )
              }
              label={`${positive ? "+" : ""}${trend}% ${
                trendLabel ?? ""
              }`}
            />
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              width: 58,
              height: 58,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              borderRadius: "14px",

              bgcolor: "rgba(37,99,235,.10)",

              color,

              "& svg": {
                fontSize: 30,
              },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default MetricCard;
