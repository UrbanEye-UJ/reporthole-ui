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
 * Step-up re-authentication dialog for viewing a contractor's decrypted email and phone number.
 *
 * The contractors table always shows the masked email and phone from GET /admin/contractors —
 * this dialog is the only path to the full values, and requires the calling admin to re-enter
 * their own password. The revealed values live only in this component's local state and are
 * discarded when the dialog closes.
 */
const RevealEmailDialog = ({ open, onClose, contractorId, contractorName }: RevealEmailDialogProps) => {
  const [revealed, setRevealed] = useState<{ email: string; phoneNumber: string } | null>(null);
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

  const { mutate, isPending, error, reset: resetMutation } = useRevealEmail();

  const handleClose = () => {
    reset();
    resetMutation();
    setRevealed(null);
    setShowPassword(false);
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    if (!contractorId) return;
    mutate(
      { id: contractorId, data: { password: values.password } },
      {
        onSuccess: (res) =>
          setRevealed({ email: res.data?.email ?? "—", phoneNumber: res.data?.phoneNumber ?? "—" }),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>View contact details — {contractorName}</DialogTitle>

      {revealed ? (
        <>
          <DialogContent>
            <Stack spacing={1.5}>
              <div>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography sx={{ wordBreak: "break-all" }}>{revealed.email}</Typography>
              </div>
              <div>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography>{revealed.phoneNumber}</Typography>
              </div>
            </Stack>
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
                Re-enter your password to view this contractor&apos;s email and phone number.
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
                              type="button"
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
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
            >
              {isPending ? "Verifying..." : "View Details"}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

export default RevealEmailDialog;
