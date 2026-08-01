import {
  Box,
  Divider,
  Typography,
} from "@mui/material";

import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";

import Panel from "../../../components/ui/Panel";
import StatusBadge from "../../../components/ui/StatusBadge";

const IncidentDetailsCard = () => {
  return (
    <Panel title="Incident Details">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Header */}

        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Large Pothole
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            ID: INC-2026-00124
          </Typography>
        </Box>

        <Divider />

        {/* Location */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <PlaceRoundedIcon color="primary" />

          <Box>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              Location
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              N1 North, Johannesburg
            </Typography>
          </Box>
        </Box>

        {/* Severity */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <WarningAmberRoundedIcon color="warning" />

          <Box>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              Severity
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              Critical
            </Typography>
          </Box>
        </Box>

        {/* Date */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CalendarTodayRoundedIcon color="info" />

          <Box>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              Reported
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              28 July 2026 • 14:42
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Status */}

        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              mb: 1,
            }}
          >
            Status
          </Typography>

          <StatusBadge status="Assigned" />
        </Box>

        <Divider />

        {/* Description */}

        <Box>
          <Typography
            sx={{
              fontWeight: 600,
              mb: 1,
            }}
          >
            Description
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.8,
            }}
          >
            Large pothole occupying the left lane. Multiple vehicles have
            reported tyre damage, causing traffic congestion and increasing
            the risk of accidents. Immediate repair is recommended to
            prevent further deterioration of the road surface.
          </Typography>
        </Box>
      </Box>
    </Panel>
  );
};

export default IncidentDetailsCard;