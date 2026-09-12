"use client";

import { useMemo, useState } from "react";

import { Alert, Button, Chip, Snackbar, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { PageHeader, Panel } from "../../_components/ui";
import DataTable from "../../_components/DataTable";

import {
  useApprove,
  useListApplications,
  useReject,
  getListApplicationsQueryKey,
} from "@/app/api/generated/admin-applications/admin-applications";
import { AdminApplicationResponseStatus } from "@/app/api/generated/openAPIDefinition.schemas";
import { getErrorMessage } from "@/lib/getErrorMessage";

import type { GridColDef } from "@mui/x-data-grid";

type Filter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_COLOR: Record<string, "warning" | "success" | "error"> = {
  [AdminApplicationResponseStatus.PENDING]: "warning",
  [AdminApplicationResponseStatus.APPROVED]: "success",
  [AdminApplicationResponseStatus.REJECTED]: "error",
};

/**
 * Every admin-access record, at any status. Token registrations land here already
 * APPROVED (with a municipality); legacy applications arrive PENDING and are
 * approved/rejected here — approving is a CIVILIAN → ADMIN grant, audited on the
 * backend, and forces the applicant to sign in again.
 */
export default function SecurityApplicationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const params = filter === "ALL" ? undefined : { status: filter };
  const { data, isLoading } = useListApplications(params);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });

  const mutationOpts = {
    onSuccess: invalidate,
    onError: (error: unknown) => setErrorMessage(getErrorMessage(error)),
    onSettled: () => setProcessingId(null),
  };
  const { mutate: approve } = useApprove({ mutation: mutationOpts });
  const { mutate: reject } = useReject({ mutation: mutationOpts });

  const applications = useMemo(() => data?.data ?? [], [data]);

  const rows = useMemo(
    () =>
      applications.map((a) => ({
        id: a.applicationId ?? "",
        applicant: `${a.applicantFirstName ?? ""} ${a.applicantLastName ?? ""}`.trim(),
        email: a.applicantEmail,
        municipality: a.municipalityName ?? "—",
        token: a.municipalityToken,
        submittedAt: a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—",
        status: a.status ?? "",
      })),
    [applications]
  );

  const columns: GridColDef[] = [
    { field: "applicant", headerName: "Applicant", flex: 1, minWidth: 150 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "municipality", headerName: "Municipality", width: 170 },
    { field: "token", headerName: "Token", width: 150 },
    { field: "submittedAt", headerName: "Submitted", width: 170 },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          size="small"
          variant="outlined"
          label={String(params.value)}
          color={STATUS_COLOR[String(params.value)] ?? "warning"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.status === AdminApplicationResponseStatus.PENDING ? (
          <Stack direction="row" spacing={1} sx={{ py: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<CheckRoundedIcon />}
              disabled={processingId === params.row.id}
              onClick={() => {
                setProcessingId(params.row.id);
                approve({ id: params.row.id });
              }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CloseRoundedIcon />}
              disabled={processingId === params.row.id}
              onClick={() => {
                setProcessingId(params.row.id);
                reject({ id: params.row.id });
              }}
            >
              Reject
            </Button>
          </Stack>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Admin Applications"
        subtitle="Every admin-access record. Approving promotes to ADMIN, writes an audit row, and requires re-sign-in."
      />

      <Panel title={`Records (${applications.length})`}>
        <Stack spacing={2}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filter}
            onChange={(_, v) => v && setFilter(v)}
          >
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as Filter[]).map((f) => (
              <ToggleButton key={f} value={f}>
                {f}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <DataTable rows={rows} columns={columns} loading={isLoading} height={520} />
        </Stack>
      </Panel>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
