"use client";

import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import Panel from "../ui/Panel";

// TODO(api): replace with data from GET /admin/dashboard/repairs-progress
// Expected shape: { contractor: string; completed: number; completedJobs: number; openJobs: number }[]
const repairs = [
  {
    contractor: "RoadFix SA",
    completed: 91,
    completedJobs: 182,
    openJobs: 18,
  },
  {
    contractor: "Metro Infrastructure",
    completed: 74,
    completedJobs: 148,
    openJobs: 52,
  },
  {
    contractor: "Gauteng Roads Agency",
    completed: 63,
    completedJobs: 126,
    openJobs: 74,
  },
  {
    contractor: "Urban Civil Works",
    completed: 48,
    completedJobs: 96,
    openJobs: 104,
  },
];

const getColor = (value: number) => {
  if (value >= 85) return "success.main";
  if (value >= 65) return "warning.main";
  return "error.main";
};

const RepairProgress = () => {
  return (
    <Panel title="Contractor Performance">
      <Stack spacing={3}>
        {repairs.map((repair) => (
          <Box
            key={repair.contractor}
            sx={{
              p: 2,
              borderRadius: 3,
              transition: ".25s",

              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {repair.contractor}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {repair.completedJobs} completed • {repair.openJobs} pending
                </Typography>
              </Box>

              <Chip
                icon={<CheckCircleRoundedIcon />}
                label={`${repair.completed}%`}
                sx={{
                  fontWeight: 700,
                  bgcolor: "rgba(255,255,255,.06)",
                }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={repair.completed}
              sx={{
                mt: 2,
                height: 10,
                borderRadius: 999,

                backgroundColor: "rgba(255,255,255,.08)",

                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundColor: getColor(repair.completed),
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Panel>
  );
};

export default RepairProgress;
