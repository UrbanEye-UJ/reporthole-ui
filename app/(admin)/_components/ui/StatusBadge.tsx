"use client";

import { Chip } from "@mui/material";

type Status =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Critical"
  | "Offline"
  | "Online";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<
  Status,
  {
    color:
      | "error"
      | "warning"
      | "info"
      | "success"
      | "default";
    variant: "filled" | "outlined";
  }
> = {
  Open: {
    color: "error",
    variant: "filled",
  },

  Assigned: {
    color: "warning",
    variant: "filled",
  },

  "In Progress": {
    color: "info",
    variant: "filled",
  },

  Resolved: {
    color: "success",
    variant: "filled",
  },

  Critical: {
    color: "error",
    variant: "outlined",
  },

  Offline: {
    color: "default",
    variant: "outlined",
  },

  Online: {
    color: "success",
    variant: "outlined",
  },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Chip
      label={status}
      size="small"
      color={config.color}
      variant={config.variant}
      sx={{
        fontWeight: 600,
        borderRadius: 2,
        minWidth: 95,
      }}
    />
  );
};

export default StatusBadge;
