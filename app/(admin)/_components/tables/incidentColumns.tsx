"use client";

import { Chip } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";

import type { AssignmentStatus } from "@/lib/hooks/useRecentIncidents";

import IncidentPhotoCell from "../incidents/IncidentPhotoCell";
import StatusBadge, { type Status } from "../ui/StatusBadge";

export const formatIncidentType = (type?: string) =>
  type
    ? type
        .toLowerCase()
        .split("_")
        .map((word) => word[0].toUpperCase() + word.slice(1))
        .join(" ")
    : "Unknown";

// AssignmentStatus (backend workflow) -> Status (badge vocabulary already used across the admin UI).
// REPORTED and VERIFIED both read as "Open" since neither has been assigned to a contractor yet.
export const STATUS_MAP: Record<AssignmentStatus, Status> = {
  REPORTED: "Open",
  VERIFIED: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const incidentColumns: GridColDef[] = [
  {
    field: "imageUrl",
    headerName: "Photo",
    width: 80,
    sortable: false,
    filterable: false,
    renderCell: (params) => (
      <IncidentPhotoCell
        incidentId={params.row.incidentId}
        imageUrl={params.row.imageUrl}
        status={params.row.status as AssignmentStatus | undefined}
      />
    ),
  },
  {
    field: "incidentType",
    headerName: "Type",
    flex: 1,
    valueFormatter: (value: string) => formatIncidentType(value),
  },
  {
    field: "source",
    headerName: "Source",
    width: 130,
    renderCell: (params) => {
      const isDashcam = params.value === "DASHCAM";
      return (
        <Chip
          label={isDashcam ? "AI Detected" : "Manual"}
          size="small"
          color={isDashcam ? "info" : "default"}
          variant={isDashcam ? "filled" : "outlined"}
          sx={{ fontWeight: 600 }}
        />
      );
    },
  },
  {
    field: "locationAddress",
    headerName: "Location",
    flex: 1.5,
    valueFormatter: (value: string) => value || "Unknown location",
  },
  {
    field: "incidentDate",
    headerName: "Reported",
    width: 140,
    valueFormatter: (value: string) =>
      value
        ? new Date(value).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
        : "—",
  },
  {
    field: "reportCount",
    headerName: "Reports",
    width: 100,
    renderCell: (params) => (
      <Chip label={params.value ?? 0} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
    ),
  },
  {
    field: "status",
    headerName: "Status",
    width: 140,
    renderCell: (params) => <StatusBadge status={STATUS_MAP[params.value as AssignmentStatus] ?? "Open"} />,
  },
];
