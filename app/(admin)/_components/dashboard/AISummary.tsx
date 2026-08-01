"use client";

import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import Panel from "../ui/Panel";

// TODO(api): replace hardcoded values with data from GET /admin/dashboard/ai-summary
// Expected shape: { confidenceScore: number; highestPriorityArea: string; unresolved: number;
//                   prediction: string; recommendedAction: string }
const AISummary = () => {
  return (
    <Panel title="AI Operations Summary">
      <Stack spacing={3}>
        <Box>
          <Chip
            icon={<AutoAwesomeRoundedIcon />}
            label="AI Model Online"
            color="success"
            sx={{
              mb: 2,
            }}
          />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Confidence Score
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "success.main",
            }}
          >
            96.8%
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Highest Priority
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 1,
              fontWeight: 600,
            }}
          >
            Johannesburg CBD
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            42 unresolved potholes detected.
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            Prediction
          </Typography>

          <Typography sx={{ mt: 1 }}>
            18 additional road failures are likely within
            the next 48 hours due to heavy rainfall.
          </Typography>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{
              mb: 1,
            }}
          >
            Recommended Action
          </Typography>

          <Typography variant="body2">
            Deploy two additional maintenance teams to
            Region F and prioritize repairs on the N1
            corridor.
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
        >
          View AI Insights
        </Button>
      </Stack>
    </Panel>
  );
};

export default AISummary;
