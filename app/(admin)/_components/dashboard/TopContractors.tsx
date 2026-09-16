"use client";

import { Avatar, Box, Chip, Stack, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";

import Panel from "../ui/Panel";

import type { ContractorResponse } from "@/app/api/generated/openAPIDefinition.schemas";

interface TopContractorsProps {
  contractors: ContractorResponse[];
}

/** Ranked list of the busiest contractors by completed jobs — top 5. */
const TopContractors = ({ contractors }: TopContractorsProps) => {
  const ranked = [...contractors]
    .sort((a, b) => (b.completedJobs ?? 0) - (a.completedJobs ?? 0))
    .slice(0, 5);

  return (
    <Panel title="Top Contractors">
      {ranked.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          No contractors registered yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {ranked.map((contractor, index) => (
            <Box
              key={contractor.userId}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: 2,
                transition: ".25s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  fontWeight: 700,
                  bgcolor: index === 0 ? "warning.main" : "action.selected",
                  color: index === 0 ? "warning.contrastText" : "text.secondary",
                }}
              >
                {index === 0 ? <EmojiEventsRoundedIcon sx={{ fontSize: 18 }} /> : index + 1}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {contractor.firstName} {contractor.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {contractor.activeJobs ?? 0} active
                </Typography>
              </Box>

              <Chip
                size="small"
                label={`${contractor.completedJobs ?? 0} completed`}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Panel>
  );
};

export default TopContractors;
