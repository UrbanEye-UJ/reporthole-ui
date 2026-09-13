"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useGetProfile,
  useUpdateProfile,
  useDeleteAccount,
} from "@/app/api/generated/user-profile/user-profile";

import PageHeader from "../../_components/ui/PageHeader";

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

  const { data, refetch, isLoading } = useGetProfile({ query: { staleTime: 0 } });
  const profile = data?.data;

  useEffect(() => {
    if (profile) {
      setEditValues({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phoneNumber: profile.phoneNumber ?? "",
      });
    }
  }, [profile]);

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

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" }) : "—";

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

      <Stack spacing={3} sx={{ maxWidth: 560 }}>

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
              <ProfileRow label="Name" value={`${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "—"} />
              <Divider />
              <ProfileRow label="Email" value={profile?.email ?? "—"} />
              <Divider />
              <ProfileRow label="Phone" value={profile?.phoneNumber ?? "—"} />
              <Divider />
              <ProfileRow label="Role" value={profile?.role ?? "—"} />
              <Divider />
              <ProfileRow label="Municipality" value={profile?.municipalityName ?? "—"} />
              <Divider />
              <ProfileRow label="Member since" value={formatDate(profile?.createdAt)} />

              <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={() => setEditing(true)}>
                Edit profile
              </Button>
            </Stack>
          )}
        </Paper>

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
