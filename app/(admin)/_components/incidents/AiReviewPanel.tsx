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

import {
  useEscalatedFrames,
  useApproveFrame,
  useDiscardFrame,
  type EscalatedFrameDTO,
} from "@/lib/hooks/useEscalatedFrames";
import { getErrorMessage } from "@/lib/getErrorMessage";

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">Confidence</Typography>
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

function formatLabel(label: string | null) {
  if (!label) return "Unknown";
  return label.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function FrameCard({
  frame,
  onApprove,
  onDiscard,
  acting,
}: {
  frame: EscalatedFrameDTO;
  onApprove: (id: string) => void;
  onDiscard: (id: string) => void;
  acting: boolean;
}) {
  return (
    <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
      {frame.imageBase64 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/jpeg;base64,${frame.imageBase64}`}
          alt={`Frame ${frame.frameId}`}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{formatLabel(frame.label)}</Typography>
            <Chip label="Needs Review" color="warning" size="small" />
          </Box>
          <ConfidenceBar value={frame.confidence} />
          <Typography variant="caption" color="text.secondary">Received {formatDate(frame.createdAt)}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="contained" color="success" size="small" startIcon={<CheckCircleRoundedIcon />}
              disabled={acting} onClick={() => onApprove(frame.frameId)} sx={{ flex: 1 }}>
              Approve
            </Button>
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteRoundedIcon />}
              disabled={acting} onClick={() => onDiscard(frame.frameId)} sx={{ flex: 1 }}>
              Discard
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * Renders the escalated AI frames queue (confidence 65–75%) as a panel.
 * Shown within the Incidents page when the "AI Detected" source filter is active.
 */
export default function AiReviewPanel() {
  const { data, isLoading } = useEscalatedFrames();
  const frames: EscalatedFrameDTO[] = data?.data ?? [];

  const [actingOn, setActingOn] = useState<string | null>(null);
  const [toast, setToast] = useState<{ severity: "success" | "error"; text: string } | null>(null);

  const { mutate: approve } = useApproveFrame();
  const { mutate: discard } = useDiscardFrame();

  const handleApprove = (frameId: string) => {
    setActingOn(frameId);
    approve(frameId, {
      onSuccess: () => setToast({ severity: "success", text: "Incident created from approved detection." }),
      onError: (err) => setToast({ severity: "error", text: getErrorMessage(err) }),
      onSettled: () => setActingOn(null),
    });
  };

  const handleDiscard = (frameId: string) => {
    setActingOn(frameId);
    discard(frameId, {
      onSuccess: () => setToast({ severity: "success", text: "Detection discarded." }),
      onError: (err) => setToast({ severity: "error", text: getErrorMessage(err) }),
      onSettled: () => setActingOn(null),
    });
  };

  return (
    <>
      <Panel title={`AI Review Queue — pending approval (${frames.length})`}>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Loading…</Typography>
        ) : frames.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">No detections awaiting review.</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
              Escalated frames appear here when dashcam confidence falls between 65% and 75%.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 3, p: 2 }}>
            {frames.map((frame) => (
              <FrameCard
                key={frame.frameId}
                frame={frame}
                acting={actingOn === frame.frameId}
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
