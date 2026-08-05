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

import { useGetContractors } from "@/lib/hooks/useContractors";

const getColor = (value: number) => {
  if (value >= 85) return "success.main";
  if (value >= 65) return "warning.main";
  return "error.main";
};

const RepairProgress = () => {
  const { data, isLoading } = useGetContractors();
  const contractors = data?.data ?? [];

  return (
    <Panel title="Contractor Performance">
      {!isLoading && contractors.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          No contractors registered yet.
        </Typography>
      )}

      <Stack spacing={3}>
        {contractors.map((contractor) => {
          const totalJobs = contractor.completedJobs + contractor.activeJobs;
          const completedPercent = totalJobs > 0 ? Math.round((contractor.completedJobs / totalJobs) * 100) : 0;

          return (
            <Box
              key={contractor.userId}
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
                    {contractor.firstName} {contractor.lastName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {contractor.completedJobs} completed • {contractor.activeJobs} pending
                  </Typography>
                </Box>

                <Chip
                  icon={<CheckCircleRoundedIcon />}
                  label={`${completedPercent}%`}
                  sx={{
                    fontWeight: 700,
                    bgcolor: (t) =>
                      t.palette.mode === "dark"
                        ? "rgba(255,255,255,.06)"
                        : "rgba(0,0,0,.06)",
                  }}
                />
              </Box>

              <LinearProgress
                variant="determinate"
                value={completedPercent}
                sx={{
                  mt: 2,
                  height: 10,
                  borderRadius: 999,

                  backgroundColor: (t: { palette: { mode: string } }) =>
                    t.palette.mode === "dark"
                      ? "rgba(255,255,255,.08)"
                      : "rgba(0,0,0,.08)",

                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    backgroundColor: getColor(completedPercent),
                  },
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </Panel>
  );
};

export default RepairProgress;
