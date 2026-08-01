import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import Panel from "../../../components/ui/Panel";

interface TimelineItem {
  title: string;
  date: string;
  completed: boolean;
}

const timeline: TimelineItem[] = [
  {
    title: "Incident Reported",
    date: "28 Jul 2026 • 08:42",
    completed: true,
  },
  {
    title: "AI Verification",
    date: "28 Jul 2026 • 08:44",
    completed: true,
  },
  {
    title: "Assigned to Contractor",
    date: "28 Jul 2026 • 09:15",
    completed: true,
  },
  {
    title: "Repair Started",
    date: "29 Jul 2026 • 10:30",
    completed: true,
  },
  {
    title: "Quality Inspection",
    date: "Pending",
    completed: false,
  },
  {
    title: "Incident Resolved",
    date: "Pending",
    completed: false,
  },
];

const IncidentTimeline = () => {
  return (
    <Panel title="Incident Timeline">
      <Stack spacing={0}>
        {timeline.map((step, index) => (
          <Box key={step.title}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                py: 2,
              }}
            >
              <Box
                sx={{
                  mt: 0.5,
                }}
              >
                {step.completed ? (
                  <CheckCircleRoundedIcon color="success" />
                ) : (
                  <RadioButtonUncheckedRoundedIcon
                    color="disabled"
                  />
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {step.date}
                </Typography>
              </Box>

              <Chip
                size="small"
                color={
                  step.completed
                    ? "success"
                    : "default"
                }
                label={
                  step.completed
                    ? "Completed"
                    : "Pending"
                }
              />
            </Box>

            {index !== timeline.length - 1 && (
              <Divider />
            )}
          </Box>
        ))}
      </Stack>
    </Panel>
  );
};

export default IncidentTimeline;