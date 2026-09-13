"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Stack,
  Typography,
} from "@mui/material";

import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

import type { WorkflowEntryDTO, WorkflowEntryDTOStatus } from "@/app/api/generated/openAPIDefinition.schemas";
import type { IncidentWithStatus, AssignmentStatus } from "@/lib/hooks/useRecentIncidents";
import { STATUS_MAP, formatIncidentType } from "../tables/incidentColumns";
import StatusBadge from "../ui/StatusBadge";
import { useReopenIncident } from "@/lib/hooks/useReopenIncident";
import { getErrorMessage } from "@/lib/getErrorMessage";
import IncidentComments from "@/components/shared/IncidentComments";

interface IncidentDetailDrawerProps {
  incident: IncidentWithStatus | null;
  onClose: () => void;
}

const STATUS_COLOR: Record<WorkflowEntryDTOStatus, "default" | "warning" | "info" | "success" | "error"> = {
  REPORTED: "error",
  VERIFIED: "warning",
  ASSIGNED: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

const STATUS_LABEL: Record<WorkflowEntryDTOStatus, string> = {
  REPORTED: "Reported",
  VERIFIED: "Verified",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function WorkflowTimeline({ entries }: { entries: WorkflowEntryDTO[] }) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No progress updates yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {entries.map((entry, i) => {
        const status = entry.status as WorkflowEntryDTOStatus | undefined;
        const isLast = i === entries.length - 1;
        return (
          <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
            {/* timeline spine */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: isLast ? "primary.main" : "grey.400",
                  flexShrink: 0,
                }}
              />
              {!isLast && <Box sx={{ width: 2, flexGrow: 1, bgcolor: "grey.300", my: 0.5 }} />}
            </Box>

            {/* content */}
            <Box sx={{ pb: isLast ? 0 : 2, minWidth: 0 }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                {status && (
                  <Chip
                    label={STATUS_LABEL[status] ?? status}
                    color={status ? STATUS_COLOR[status] : "default"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {formatDate(entry.updatedDate)}
                </Typography>
              </Box>
              {entry.updatedBy && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  by {entry.updatedBy}
                </Typography>
              )}
              {entry.notes && (
                <Typography variant="body2" sx={{ mt: 0.5, wordBreak: "break-word" }}>
                  {entry.notes}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export default function IncidentDetailDrawer({ incident, onClose }: IncidentDetailDrawerProps) {
  const open = !!incident;
  const history: WorkflowEntryDTO[] = incident?.workflowHistory ?? [];
  const uiStatus = STATUS_MAP[(incident?.status ?? "REPORTED") as AssignmentStatus] ?? "Open";
  const isResolved = incident?.status === "RESOLVED";

  const { mutate: reopen, isPending: reopening, error: reopenError, reset: resetReopen } = useReopenIncident();

  const handleReopen = () => {
    if (!incident?.incidentId) return;
    reopen(incident.incidentId, { onSuccess: onClose });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 420 }, p: 3 } } }}
    >
      {incident && (
        <Stack spacing={2} sx={{ height: "100%", overflow: "auto" }}>
          {/* Header */}
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatIncidentType(incident.incidentType)}
              </Typography>
              <StatusBadge status={uiStatus} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {incident.locationAddress || "Unknown location"}
            </Typography>
          </Box>

          <Divider />

          {/* Meta */}
          <Stack spacing={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block" }}
            >
              Details
            </Typography>
            <Typography variant="body2">
              <strong>Reported:</strong>{" "}
              {incident.incidentDate
                ? new Date(incident.incidentDate).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Reports:</strong> {incident.reportCount ?? 0}
            </Typography>
            {incident.description && (
              <Typography variant="body2">
                <strong>Description:</strong> {incident.description}
              </Typography>
            )}
          </Stack>

          <Divider />

          {/* Workflow history */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1.5 }}
            >
              Progress Timeline
            </Typography>
            <WorkflowTimeline entries={history} />
          </Box>

          <Divider />

          {/* Comments */}
          <Box>
            <IncidentComments incidentId={incident.incidentId} />
          </Box>

          {/* Admin reopen action — only shown for resolved incidents */}
          {isResolved && (
            <Box>
              <Divider sx={{ mb: 2 }} />
              {reopenError && (
                <Alert severity="error" onClose={resetReopen} sx={{ mb: 1.5 }}>
                  {getErrorMessage(reopenError)}
                </Alert>
              )}
              <Button
                variant="outlined"
                startIcon={<LockOpenRoundedIcon />}
                onClick={handleReopen}
                disabled={reopening}
                fullWidth
              >
                {reopening ? "Reopening…" : "Reopen Incident"}
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
