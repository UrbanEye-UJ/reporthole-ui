"use client";

import { useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useReveal } from "@/app/api/generated/security-admin/security-admin";
import { getErrorMessage } from "@/lib/getErrorMessage";

const schema = z.object({
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

interface RevealAccountDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  maskedName: string;
}

/**
 * Step-up re-authentication dialog for viewing an account's decrypted name and email.
 *
 * The Manage Accounts table always shows masked name/email — this dialog is the only path
 * to the full values, requires the calling security admin's own password, and is itself
 * recorded on the audit trail as a PII_REVEALED entry. The revealed value lives only in this
 * component's local state and is discarded when the dialog closes.
 */
const RevealAccountDialog = ({ open, onClose, userId, maskedName }: RevealAccountDialogProps) => {
  const [revealed, setRevealed] = useState<{ name: string; email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "" },
  });

  const { mutate, isPending, error, reset: resetMutation } = useReveal();

  const handleClose = () => {
    reset();
    resetMutation();
    setRevealed(null);
    setShowPassword(false);
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    if (!userId) return;
    mutate(
      { userId, data: { password: values.password } },
      { onSuccess: (res) => setRevealed({ name: res.data?.name ?? "", email: res.data?.email ?? "" }) }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>View account — {maskedName}</DialogTitle>

      {revealed ? (
        <>
          <DialogContent>
            <Stack spacing={1}>
              <Typography sx={{ wordBreak: "break-word" }}>{revealed.name}</Typography>
              <Typography sx={{ wordBreak: "break-all" }} color="text.secondary">{revealed.email}</Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose} variant="contained">Done</Button>
          </DialogActions>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Re-enter your password to view this account&apos;s name and email. This is recorded on the audit trail.
              </Typography>

              {error && <Alert severity="error">{getErrorMessage(error, "Incorrect password.")}</Alert>}

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    autoFocus
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((v) => !v)}
                              edge="end"
                              size="small"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? "Verifying..." : "View"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default RevealAccountDialog;
