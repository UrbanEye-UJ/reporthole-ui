"use client";

import { useMemo, useState } from "react";

import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { PageHeader, Panel } from "../../_components/ui";
import DataTable from "../../_components/DataTable";
import RevealAccountDialog from "../../_components/RevealAccountDialog";

import {
  useForceLogout,
  useGrantRole,
  useListUsers,
  useReactivate,
  useRevokeRole,
  useSuspend,
  getListUsersQueryKey,
} from "@/app/api/generated/security-admin/security-admin";
import { useList as useListMunicipalities } from "@/app/api/generated/municipalities/municipalities";
import {
  GrantRoleRequestRole,
  SecurityUserResponseRole,
  type SecurityUserResponse,
} from "@/app/api/generated/openAPIDefinition.schemas";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useQueryClient } from "@tanstack/react-query";

import type { GridColDef } from "@mui/x-data-grid";

const ALL_ROLES = "all";

type Step = "menu" | "grant" | "revoke" | "suspend" | "reactivate" | "forceLogout";

const ACTION_LABELS: Record<Exclude<Step, "menu">, string> = {
  grant: "Grant / change role",
  revoke: "Revoke role (to CIVILIAN)",
  suspend: "Suspend account",
  reactivate: "Reactivate account",
  forceLogout: "Force logout (revoke sessions)",
};

const STATUS_COLOR: Record<string, "success" | "error" | "warning" | "default"> = {
  ACTIVE: "success",
  SUSPENDED: "error",
  LOCKED: "warning",
  PENDING_VERIFICATION: "warning",
  DELETED: "default",
};

/**
 * Pick an account from the list, then grant/revoke a role, suspend/reactivate, or
 * force every session to sign in again. Every action needs a reason and is written
 * to the access-control audit trail. The Audit Trail screen deep-links here with
 * ?userId= to pre-select a row.
 */
export default function SecurityAccountPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useListUsers();
  const users = useMemo(() => data?.data ?? [], [data]);

  // Deep link from the Audit Trail: ?userId=<uuid>. Read once, then it's just state
  // driven by the "Manage" buttons — the dialog opens when this id resolves to a
  // loaded user, so no effect is needed to wait for the list.
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("userId");
  });
  const [step, setStep] = useState<Step>("menu");
  const [reason, setReason] = useState("");
  const [role, setRole] = useState<GrantRoleRequestRole>(GrantRoleRequestRole.ADMIN);
  const [municipalityId, setMunicipalityId] = useState("");
  const [toast, setToast] = useState<{ severity: "success" | "error"; text: string } | null>(null);

  const { data: municipalitiesData } = useListMunicipalities();
  const municipalities = useMemo(() => municipalitiesData?.data ?? [], [municipalitiesData]);
  const municipalityRequired = step === "grant" && role === GrantRoleRequestRole.ADMIN;

  // Search and role filter. Name/email are masked server-side (see SecurityUserResponse), so
  // search only matches whatever's actually visible: the unmasked first name, the masked
  // email's first character + domain, or the full user id — never the hidden PII itself.
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>(ALL_ROLES);
  const [revealTarget, setRevealTarget] = useState<SecurityUserResponse | null>(null);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== ALL_ROLES && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (u.name ?? "").toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.userId ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const selected: SecurityUserResponse | null = useMemo(
    () => users.find((u) => u.userId === selectedId) ?? null,
    [users, selectedId]
  );

  const openManage = (id: string) => {
    setSelectedId(id);
    setStep("menu");
    setReason("");
    setMunicipalityId("");
  };

  const close = () => {
    setSelectedId(null);
    setStep("menu");
    setReason("");
    setMunicipalityId("");
  };

  const onError = (error: unknown) =>
    setToast({ severity: "error", text: getErrorMessage(error) });
  const onSuccess = (text: string) => () => {
    setToast({ severity: "success", text });
    queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
    close();
  };

  const grant = useGrantRole({ mutation: { onSuccess: onSuccess("Role granted."), onError } });
  const revoke = useRevokeRole({ mutation: { onSuccess: onSuccess("Role revoked."), onError } });
  const suspend = useSuspend({ mutation: { onSuccess: onSuccess("Account suspended."), onError } });
  const reactivate = useReactivate({ mutation: { onSuccess: onSuccess("Account reactivated."), onError } });
  const forceLogout = useForceLogout({ mutation: { onSuccess: onSuccess("Sessions revoked."), onError } });

  const pending =
    grant.isPending || revoke.isPending || suspend.isPending || reactivate.isPending || forceLogout.isPending;

  const submit = () => {
    if (!selected?.userId) return;
    const id = selected.userId;
    const r = reason.trim();
    if (!r) return;
    if (municipalityRequired && !municipalityId) return;
    switch (step) {
      case "grant":
        grant.mutate({
          userId: id,
          data: { role, municipalityId: municipalityRequired ? municipalityId : undefined, reason: r },
        });
        break;
      case "revoke":
        revoke.mutate({ userId: id, data: { reason: r } });
        break;
      case "suspend":
        suspend.mutate({ userId: id, data: { reason: r } });
        break;
      case "reactivate":
        reactivate.mutate({ userId: id, data: { reason: r } });
        break;
      case "forceLogout":
        forceLogout.mutate({ userId: id, data: { reason: r } });
        break;
    }
  };

  const rows = filteredUsers.map((u) => ({
    id: u.userId ?? "",
    name: u.name ?? "",
    email: u.email ?? "",
    role: u.role ?? "",
    status: u.status ?? "",
  }));

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {String(params.value)}
          {String(params.value).endsWith("@reporthole-test.local") && (
            <Chip size="small" label="test" sx={{ fontSize: 10, height: 18 }} />
          )}
        </span>
      ),
    },
    { field: "role", headerName: "Role", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Chip
          size="small"
          variant="outlined"
          label={String(params.value)}
          color={STATUS_COLOR[String(params.value)] ?? "default"}
        />
      ),
    },
    { field: "id", headerName: "User ID", width: 300 },
    {
      field: "actions",
      headerName: "",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            onClick={() => {
              const user = users.find((u) => u.userId === params.row.id);
              if (user) setRevealTarget(user);
            }}
          >
            View
          </Button>
          <Button size="small" onClick={() => openManage(params.row.id)}>
            Manage
          </Button>
        </Stack>
      ),
    },
  ];

  const actionKeys = Object.keys(ACTION_LABELS) as Exclude<Step, "menu">[];

  return (
    <>
      <PageHeader
        title="Manage Accounts"
        subtitle="Select an account, then act on it. Every action needs a reason and is recorded on the audit trail."
      />

      <Panel title={`Users (${filteredUsers.length}${filteredUsers.length !== users.length ? ` of ${users.length}` : ""})`}>
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            label="Search"
            placeholder="Name, email, or user ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="account-role-filter-label">Role</InputLabel>
            <Select
              labelId="account-role-filter-label"
              label="Role"
              value={roleFilter}
              onChange={(e: SelectChangeEvent) => setRoleFilter(e.target.value)}
            >
              <MenuItem value={ALL_ROLES}>All roles</MenuItem>
              {Object.values(SecurityUserResponseRole).map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <DataTable rows={rows} columns={columns} loading={isLoading} height={560} />
      </Panel>

      <RevealAccountDialog
        open={revealTarget !== null}
        onClose={() => setRevealTarget(null)}
        userId={revealTarget?.userId ?? null}
        maskedName={revealTarget?.name ?? ""}
      />

      <Dialog open={selected !== null} onClose={close} fullWidth maxWidth="xs">
        {selected && (
          <>
            <DialogTitle>
              {step === "menu" ? selected.name : ACTION_LABELS[step]}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selected.email} · {selected.role} · {selected.status}
                </Typography>

                {step === "menu" && (
                  <Stack spacing={1.25}>
                    {actionKeys.map((key) => (
                      <Button
                        key={key}
                        variant="outlined"
                        color={key === "suspend" || key === "forceLogout" ? "error" : "primary"}
                        onClick={() => {
                          setReason("");
                          setStep(key);
                        }}
                      >
                        {ACTION_LABELS[key]}
                      </Button>
                    ))}
                  </Stack>
                )}

                {step === "grant" && (
                  <TextField
                    select
                    label="Role"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value as GrantRoleRequestRole);
                      setMunicipalityId("");
                    }}
                  >
                    {Object.values(GrantRoleRequestRole).map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {municipalityRequired && (
                  <TextField
                    select
                    label="Municipality"
                    value={municipalityId}
                    onChange={(e) => setMunicipalityId(e.target.value)}
                    required
                    helperText="Which municipality this admin is scoped to"
                  >
                    {municipalities.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {step !== "menu" && (
                  <TextField
                    label="Reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    multiline
                    minRows={2}
                    required
                    slotProps={{ htmlInput: { maxLength: 500 } }}
                  />
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              {step === "menu" ? (
                <Button onClick={close}>Close</Button>
              ) : (
                <>
                  <Button onClick={() => setStep("menu")}>Back</Button>
                  <Button
                    variant="contained"
                    color={step === "suspend" || step === "forceLogout" ? "error" : "primary"}
                    disabled={!reason.trim() || pending || (municipalityRequired && !municipalityId)}
                    onClick={submit}
                  >
                    Confirm
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={!!toast} autoHideDuration={6000} onClose={() => setToast(null)}>
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)}>
            {toast.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
