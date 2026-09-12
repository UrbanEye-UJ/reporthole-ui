"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRevealEmail } from "@/app/api/generated/admin-contractors/admin-contractors";
import { getErrorMessage } from "@/lib/getErrorMessage";

const schema = z.object({
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

interface RevealEmailDialogProps {
  open: boolean;
  onClose: () => void;
  contractorId: string | null;
  contractorName: string;
}

/**
 * Step-up re-authentication dialog for viewing a contractor's decrypted email.
 *
 * The contractors table always shows the masked email from GET /admin/contractors —
 * this dialog is the only path to the full address, and requires the calling admin
 * to re-enter their own password. The revealed value lives only in this component's
 * local state and is discarded when the dialog closes.
 */
const RevealEmailDialog = ({ open, onClose, contractorId, contractorName }: RevealEmailDialogProps) => {
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  const { mutate, isPending, error, reset: resetMutation } = useRevealEmail();

  const handleClose = () => {
    reset();
    resetMutation();
    setRevealedEmail(null);
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    if (!contractorId) return;
    mutate(
      { id: contractorId, data: { password: values.password } },
      { onSuccess: (res) => setRevealedEmail(res.data?.email ?? null) }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>View email — {contractorName}</DialogTitle>

      {revealedEmail ? (
        <>
          <DialogContent>
            <Typography sx={{ wordBreak: "break-all" }}>{revealedEmail}</Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={handleClose}
              variant="contained"
            >
              Done
            </Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack
              spacing={2}
              sx={{ mt: 1 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Re-enter your password to view this contractor&apos;s email address.
              </Typography>

              {error && <Alert severity="error">{getErrorMessage(error, "Incorrect password.")}</Alert>}

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your password"
                    type="password"
                    fullWidth
                    autoFocus
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
            >
              {isPending ? "Verifying..." : "View Email"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default RevealEmailDialog;
