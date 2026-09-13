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
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import { PageHeader, Panel } from "../../_components/ui";
import DataTable from "../../_components/DataTable";

import {
  useCreate,
  useIssueToken,
  useList,
  useListTokens,
  useRevokeToken,
  getListQueryKey,
  getListTokensQueryKey,
} from "@/app/api/generated/municipalities/municipalities";
import { MunicipalityTokenResponseStatus } from "@/app/api/generated/openAPIDefinition.schemas";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { GridColDef } from "@mui/x-data-grid";

const STATUS_COLOR: Record<string, "success" | "warning" | "default"> = {
  [MunicipalityTokenResponseStatus.ACTIVE]: "success",
  [MunicipalityTokenResponseStatus.EXPIRED]: "warning",
  [MunicipalityTokenResponseStatus.REVOKED]: "default",
};

/**
 * Security-admin management of municipalities and their admin-registration tokens.
 *
 * Create a municipality, issue a multi-use token against it, then hand that token
 * to a prospective admin — entering it on the registration form registers them
 * straight as ADMIN for that municipality. Tokens can be revoked here.
 */
export default function SecurityMunicipalitiesPage() {
  const queryClient = useQueryClient();
  const { data: municipalitiesData, isLoading: municipalitiesLoading } = useList();
  const { data: tokensData, isLoading: tokensLoading } = useListTokens();

  const [toast, setToast] = useState<{ severity: "success" | "error"; text: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [province, setProvince] = useState("Gauteng");
  const [issueFor, setIssueFor] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState("");
  const [note, setNote] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const municipalities = useMemo(() => municipalitiesData?.data ?? [], [municipalitiesData]);
  const tokens = useMemo(() => tokensData?.data ?? [], [tokensData]);

  const refreshMunicipalities = () =>
    queryClient.invalidateQueries({ queryKey: getListQueryKey() });
  const refreshTokens = () =>
    queryClient.invalidateQueries({ queryKey: getListTokensQueryKey() });

  const onError = (error: unknown) =>
    setToast({ severity: "error", text: getErrorMessage(error) });

  const createMutation = useCreate({
    mutation: {
      onSuccess: () => {
        refreshMunicipalities();
        setCreateOpen(false);
        setName("");
        setProvince("Gauteng");
        setToast({ severity: "success", text: "Municipality created." });
      },
      onError,
    },
  });

  const issueMutation = useIssueToken({
    mutation: {
      onSuccess: (res) => {
        refreshTokens();
        refreshMunicipalities();
        setIssueFor(null);
        setExpiresInDays("");
        setNote("");
        setRecipientEmail("");
        const token = res.data?.token ?? "";
        const msg = recipientEmail.trim()
          ? `Token ${token} issued and emailed to ${recipientEmail.trim()}.`
          : `Token ${token} issued.`;
        setToast({ severity: "success", text: msg });
      },
      onError,
    },
  });

  const revokeMutation = useRevokeToken({
    mutation: {
      onSuccess: () => {
        refreshTokens();
        setToast({ severity: "success", text: "Token revoked." });
      },
      onError,
    },
  });

  const municipalityColumns: GridColDef[] = [
    { field: "name", headerName: "Municipality", flex: 1, minWidth: 200 },
    { field: "province", headerName: "Province", width: 140 },
    { field: "tokenCount", headerName: "Tokens issued", width: 130 },
    {
      field: "actions",
      headerName: "",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => setIssueFor(params.row.id)}>
          Issue token
        </Button>
      ),
    },
  ];

  const municipalityRows = municipalities.map((m) => ({
    id: m.id ?? "",
    name: m.name ?? "",
    province: m.province ?? "",
    tokenCount: m.tokenCount ?? 0,
  }));

  const tokenColumns: GridColDef[] = [
    { field: "token", headerName: "Token", width: 175 },
    { field: "municipalityName", headerName: "Municipality", flex: 1, minWidth: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          variant="outlined"
          label={String(params.value)}
          color={STATUS_COLOR[String(params.value)] ?? "default"}
        />
      ),
    },
    { field: "issuedAt", headerName: "Issued", width: 140 },
    { field: "expiresAt", headerName: "Expires", width: 140 },
    {
      field: "revoke",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.status === MunicipalityTokenResponseStatus.ACTIVE ? (
          <Button
            size="small"
            color="error"
            disabled={revokeMutation.isPending}
            onClick={() => revokeMutation.mutate({ tokenId: params.row.id })}
          >
            Revoke
          </Button>
        ) : null,
    },
  ];

  const tokenRows = tokens.map((t, i) => ({
    id: t.id ?? String(i),
    token: t.token ?? "",
    municipalityName: t.municipalityName ?? "",
    status: t.status ?? "",
    issuedByName: t.issuedByName ?? "",
    issuedAt: t.issuedAt ? new Date(t.issuedAt).toLocaleString() : "—",
    expiresAt: t.expiresAt ? new Date(t.expiresAt).toLocaleString() : "Never",
  }));

  return (
    <>
      <PageHeader
        title="Municipalities"
        subtitle="Issue a token against a municipality; entering it on the registration form makes that person an ADMIN for it."
        actions={
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Add municipality
          </Button>
        }
      />

      <Stack spacing={3}>
        <Panel title={`Municipalities (${municipalities.length})`}>
          <DataTable
            rows={municipalityRows}
            columns={municipalityColumns}
            loading={municipalitiesLoading}
            height={340}
          />
        </Panel>

        <Panel title={`Registration tokens (${tokens.length})`}>
          <DataTable
            rows={tokenRows}
            columns={tokenColumns}
            loading={tokensLoading}
            height={420}
          />
        </Panel>
      </Stack>

      {/* Create municipality */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add municipality</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <TextField
              select
              label="Province"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              {["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"].map(
                (p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                )
              )}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!name.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate({ data: { name: name.trim(), province } })}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue token */}
      <Dialog open={issueFor !== null} onClose={() => { setIssueFor(null); setRecipientEmail(""); }} fullWidth maxWidth="xs">
        <DialogTitle>Issue registration token</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Send token to (email)"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              helperText="Token will be emailed to this address after issuing"
              autoFocus
            />
            <TextField
              label="Expires in (days)"
              type="number"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              helperText="Leave blank for a token that never expires"
            />
            <TextField
              label="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIssueFor(null); setRecipientEmail(""); }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={issueMutation.isPending}
            onClick={() =>
              issueFor &&
              issueMutation.mutate({
                id: issueFor,
                data: {
                  expiresInDays: expiresInDays.trim() ? Number(expiresInDays) : undefined,
                  note: note.trim() || undefined,
                  recipientEmail: recipientEmail.trim() || undefined,
                },
              })
            }
          >
            Issue
          </Button>
        </DialogActions>
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
