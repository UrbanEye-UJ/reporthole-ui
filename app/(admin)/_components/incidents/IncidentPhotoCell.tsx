"use client";

import { useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import { useVerifyIncident } from "@/lib/hooks/useVerifyIncident";
import { getErrorMessage } from "@/lib/getErrorMessage";
import type { AssignmentStatus } from "@/lib/hooks/useRecentIncidents";

interface IncidentPhotoCellProps {
  incidentId: string;
  imageUrl?: string;
  status?: AssignmentStatus;
}

const IncidentPhotoCell = ({ incidentId, imageUrl, status }: IncidentPhotoCellProps) => {
  const [open, setOpen] = useState(false);
  const { mutate, isPending, error, reset } = useVerifyIncident();

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleVerify = () => {
    mutate(incidentId, { onSuccess: handleClose });
  };

  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)}>
        {imageUrl ? (
          <Avatar variant="rounded" src={imageUrl} sx={{ width: 32, height: 32 }} />
        ) : (
          <VisibilityRoundedIcon fontSize="small" />
        )}
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Incident Photo</DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {getErrorMessage(error)}
            </Alert>
          )}

          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt="Reported incident"
              sx={{ width: "100%", borderRadius: 1, display: "block" }}
            />
          ) : (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No photo available for this incident.
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose}>Close</Button>
          {status === "REPORTED" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<VerifiedRoundedIcon />}
              onClick={handleVerify}
              disabled={isPending}
            >
              {isPending ? "Verifying..." : "Verify"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IncidentPhotoCell;
