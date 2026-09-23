"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import {
  useGetProfile,
  useUpdateProfile,
  useDeleteAccount,
  useVerifyPassword,
} from "@/app/api/generated/user-profile/user-profile";

import PageHeader from "../../_components/ui/PageHeader";
import { maskName, maskEmail, maskPhone } from "@/lib/piiMask";
import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";
import InstallInstructionsModal from "@/components/shared/InstallInstructionsModal";

type EditState = { firstName: string; lastName: string; phoneNumber: string };

/**
 * Profile page for admin users — uses MUI components to stay consistent with the admin shell.
 */
export default function AdminProfilePage() {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editValues, setEditValues] = useState<EditState>({ firstName: "", lastName: "", phoneNumber: "" });
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sensitive-field reveal state — once verified the values are visible for this session
  const [revealed, setRevealed] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const { canInstall, isStandalone, isIOS, promptInstall } = useInstallPrompt();
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const handleInstallClick = () => {
    if (canInstall) {
      promptInstall();
    } else {
      setShowInstallInstructions(true);
    }
  };

  const { data, refetch, isLoading } = useGetProfile({ query: { staleTime: 0 } });
  const profile = data?.data;

  const { mutate: verifyPassword, isPending: verifying } = useVerifyPassword({
    mutation: {
      onSuccess: () => {
        setRevealed(true);
        setShowPasswordDialog(false);
        setPasswordInput("");
        setVerifyError(null);
        setShowPasswordInput(false);
      },
      onError: () => setVerifyError("Incorrect password. Please try again."),
    },
  });


  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile({
    mutation: {
      onSuccess: () => { setEditing(false); setSaveError(null); refetch(); },
      onError: () => setSaveError("Failed to save changes. Please try again."),
    },
  });

  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount({
    mutation: {
      onSuccess: () => {
        document.cookie = "reporthole_token=; path=/; max-age=0";
        document.cookie = "reporthole_role=; path=/; max-age=0";
        document.cookie = "reporthole_user_id=; path=/; max-age=0";
        router.push("/");
      },
      onError: () => setConfirmDelete(false),
    },
  });

  const handleSave = () => {
    const { firstName, lastName, phoneNumber } = editValues;
    if (!firstName.trim() || !lastName.trim() || !phoneNumber.trim()) {
      setSaveError("All fields are required.");
      return;
    }
    updateProfile({ data: { firstName, lastName, phoneNumber } });
  };

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteAccount();
  };

  const handleRevealSubmit = () => {
    if (!passwordInput.trim()) { setVerifyError("Please enter your password."); return; }
    verifyPassword({ data: { password: passwordInput } });
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—";

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "—";
  const email = profile?.email ?? "—";
  const phone = profile?.phoneNumber ?? "—";

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Typography color="text.secondary">Loading profile…</Typography>
      </Box>
    );
  }

  return (
    <>
      <PageHeader title="My Profile" subtitle="View and update your account details." />

      <Stack spacing={3} sx={{ maxWidth: 560, mx: "auto" }}>

        {/* Profile card */}
        <Paper elevation={0} sx={{ p: 3 }}>
          {editing ? (
            <Stack spacing={2.5}>
              <TextField
                label="First name"
                value={editValues.firstName}
                onChange={(e) => setEditValues((v) => ({ ...v, firstName: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Last name"
                value={editValues.lastName}
                onChange={(e) => setEditValues((v) => ({ ...v, lastName: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Phone number"
                type="tel"
                value={editValues.phoneNumber}
                onChange={(e) => setEditValues((v) => ({ ...v, phoneNumber: e.target.value }))}
                fullWidth
              />

              {saveError && <Alert severity="error">{saveError}</Alert>}

              <Stack direction="row" spacing={1.5}>
                <Button fullWidth variant="outlined" onClick={() => { setEditing(false); setSaveError(null); }}>
                  Cancel
                </Button>
                <Button fullWidth variant="contained" disabled={isSaving} onClick={handleSave}>
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <SensitiveRow
                label="Name"
                value={fullName}
                masked={fullName === "—" ? fullName : maskName(fullName)}
                revealed={revealed}
                onReveal={() => setShowPasswordDialog(true)}
                onHide={() => setRevealed(false)}
              />
              <Divider />
              <SensitiveRow
                label="Email"
                value={email}
                masked={email === "—" ? email : maskEmail(email)}
                revealed={revealed}
                onReveal={() => setShowPasswordDialog(true)}
                onHide={() => setRevealed(false)}
              />
              <Divider />
              <SensitiveRow
                label="Phone"
                value={phone}
                masked={phone === "—" ? phone : maskPhone(phone)}
                revealed={revealed}
                onReveal={() => setShowPasswordDialog(true)}
                onHide={() => setRevealed(false)}
              />
              <Divider />
              <ProfileRow label="Role" value={profile?.role ?? "—"} />
              <Divider />
              <ProfileRow label="Municipality" value={profile?.municipalityName ?? "—"} />
              <Divider />
              <ProfileRow label="Member since" value={formatDate(profile?.createdAt)} />

              {!revealed && (
                <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center" }}>
                  Click the eye icon next to a field to reveal sensitive information.
                </Typography>
              )}

              <Button
                  fullWidth
                  variant="contained"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setEditValues({
                      firstName: profile?.firstName ?? "",
                      lastName: profile?.lastName ?? "",
                      phoneNumber: profile?.phoneNumber ?? "",
                    });
                    setEditing(true);
                  }}
              >
                Edit profile
              </Button>
            </Stack>
          )}
        </Paper>

        {/* Install app — always shown unless already installed */}
        {!editing && !isStandalone && (
          <ButtonBase
            onClick={handleInstallClick}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              textAlign: "left",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "action.selected", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GetAppRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Install app</Typography>
                <Typography variant="caption" color="text.secondary">Add Reporthole to your home screen</Typography>
              </Box>
            </Box>
            <ChevronRightRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
          </ButtonBase>
        )}

        {/* Danger zone */}
        {!editing && (
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "error.main", borderRadius: 2 }}>
            <Typography variant="subtitle2" color="error" sx={{ fontWeight: 700, mb: 1 }}>
              Danger zone
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Deleting your account is permanent. Your action history will remain in the system but you will no longer be able to log in.
            </Typography>

            {confirmDelete && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure? This cannot be undone.
              </Alert>
            )}

            <Stack direction="row" spacing={1.5}>
              {confirmDelete && (
                <Button fullWidth variant="outlined" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              )}
              <Button
                fullWidth
                variant={confirmDelete ? "contained" : "outlined"}
                color="error"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting…" : confirmDelete ? "Confirm delete" : "Delete account"}
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>

      <Dialog
        open={showPasswordDialog}
        onClose={() => { setShowPasswordDialog(false); setPasswordInput(""); setVerifyError(null); setShowPasswordInput(false); }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Confirm your identity</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Enter your password to reveal sensitive profile information.
            </Typography>
            {verifyError && <Alert severity="error">{verifyError}</Alert>}
            <TextField
              label="Your password"
              type={showPasswordInput ? "text" : "password"}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRevealSubmit()}
              fullWidth
              autoFocus
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPasswordInput((v) => !v)}
                        edge="end"
                        size="small"
                        aria-label={showPasswordInput ? "Hide password" : "Show password"}
                      >
                        {showPasswordInput ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setShowPasswordDialog(false); setPasswordInput(""); setVerifyError(null); setShowPasswordInput(false); }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={verifying || !passwordInput.trim()}
            onClick={handleRevealSubmit}
          >
            {verifying ? "Verifying…" : "Reveal"}
          </Button>
        </DialogActions>
      </Dialog>

      <InstallInstructionsModal
        open={showInstallInstructions}
        onClose={() => setShowInstallInstructions(false)}
        isIOS={isIOS}
      />
    </>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "right" }}>
        {value}
      </Typography>
    </Box>
  );
}

interface SensitiveRowProps {
  label: string;
  value: string;
  masked: string;
  revealed: boolean;
  onReveal: () => void;
  onHide: () => void;
}

function SensitiveRow({ label, value, masked, revealed, onReveal, onHide }: SensitiveRowProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, flexShrink: 0 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
        <Typography variant="body2" sx={{ textAlign: "right" }}>
          {revealed ? value : masked}
        </Typography>
        <IconButton
          size="small"
          onClick={revealed ? onHide : onReveal}
          aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
        >
          {revealed ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
        </IconButton>
      </Stack>
    </Box>
  );
}
