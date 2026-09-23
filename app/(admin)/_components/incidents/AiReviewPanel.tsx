"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import Panel from "../ui/Panel";

import { useGetIncidentsPendingAiReview, useDeleteIncident } from "@/app/api/generated/incidents/incidents";
import { useVerifyIncident } from "@/lib/hooks/useVerifyIncident";
import type { IncidentResponseDTO } from "@/app/api/generated/openAPIDefinition.schemas";
import { getErrorMessage } from "@/lib/getErrorMessage";

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">AI confidence</Typography>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>{pct}%</Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={pct >= 70 ? "warning" : "info"}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
}

function formatLabel(label?: string) {
  if (!label) return "Unknown";
  return label.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function IncidentReviewCard({
  incident,
  onApprove,
  onDiscard,
  acting,
}: {
  incident: IncidentResponseDTO;
  onApprove: (id: string) => void;
  onDiscard: (id: string) => void;
  acting: boolean;
}) {
  return (
    <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
      {incident.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={incident.imageUrl}
          alt={`Incident ${incident.incidentId}`}
          style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }}
        />
      ) : (
        <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "action.hover" }}>
          <Typography variant="body2" color="text.secondary">No preview</Typography>
        </Box>
      )}
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatLabel(incident.incidentType)}</Typography>
            <Chip label="Needs Review" color="warning" size="small" />
          </Box>
          <ConfidenceBar value={incident.aiConfidence ?? 0} />
          <Typography variant="caption" color="text.secondary">Reported {formatDate(incident.incidentDate)}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" color="success" size="small" startIcon={<CheckCircleRoundedIcon />}
              disabled={acting} onClick={() => incident.incidentId && onApprove(incident.incidentId)} sx={{ flex: 1 }}>
              Approve
            </Button>
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteRoundedIcon />}
              disabled={acting} onClick={() => incident.incidentId && onDiscard(incident.incidentId)} sx={{ flex: 1 }}>
              Discard
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * Renders the AI review queue as a panel — every AI-generated incident (civilian AI-assisted
 * report, or dashcam detection) whose confidence landed below the auto-approval threshold, so
 * it's sitting as REPORTED instead of auto-verified. Approve verifies it like any manually
 * checked incident; discard deletes it. Shown within the Incidents page when the "AI Detected"
 * source filter is active.
 */
export default function AiReviewPanel() {
  const { data, isLoading } = useGetIncidentsPendingAiReview();
  const incidents: IncidentResponseDTO[] = data?.data ?? [];

  const [actingOn, setActingOn] = useState<string | null>(null);
  const [toast, setToast] = useState<{ severity: "success" | "error"; text: string } | null>(null);

  const { mutate: verify } = useVerifyIncident();
  const { mutate: deleteIncident } = useDeleteIncident();

  const handleApprove = (incidentId: string) => {
    setActingOn(incidentId);
    verify(incidentId, {
      onSuccess: () => setToast({ severity: "success", text: "Incident verified." }),
      onError: (err) => setToast({ severity: "error", text: getErrorMessage(err) }),
      onSettled: () => setActingOn(null),
    });
  };

  const handleDiscard = (incidentId: string) => {
    setActingOn(incidentId);
    deleteIncident(
      { id: incidentId },
      {
        onSuccess: () => setToast({ severity: "success", text: "Detection discarded." }),
        onError: (err) => setToast({ severity: "error", text: getErrorMessage(err) }),
        onSettled: () => setActingOn(null),
      }
    );
  };

  return (
    <>
      <Panel title={`AI Review Queue — pending approval (${incidents.length})`}>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Loading…</Typography>
        ) : incidents.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">No detections awaiting review.</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              AI-generated reports appear here when their confidence is below the auto-approval threshold.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 3, p: 2 }}>
            {incidents.map((incident) => (
              <IncidentReviewCard
                key={incident.incidentId}
                incident={incident}
                acting={actingOn === incident.incidentId}
                onApprove={handleApprove}
                onDiscard={handleDiscard}
              />
            ))}
          </Box>
        )}
      </Panel>

      <Snackbar open={!!toast} autoHideDuration={5000} onClose={() => setToast(null)}>
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>{toast.text}</Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
