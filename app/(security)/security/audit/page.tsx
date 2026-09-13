"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Button, Chip } from "@mui/material";

import { PageHeader, Panel } from "../../_components/ui";
import DataTable from "../../_components/DataTable";

import { useListAudit } from "@/app/api/generated/security-admin/security-admin";
import { AuditEntryResponseAction } from "@/app/api/generated/openAPIDefinition.schemas";

import type { GridColDef } from "@mui/x-data-grid";

const ACTION_COLOR: Record<
  string,
  "default" | "success" | "warning" | "error" | "info"
> = {
  [AuditEntryResponseAction.ROLE_GRANTED]: "success",
  [AuditEntryResponseAction.ROLE_REVOKED]: "warning",
  [AuditEntryResponseAction.ACCOUNT_SUSPENDED]: "error",
  [AuditEntryResponseAction.ACCOUNT_REACTIVATED]: "info",
  [AuditEntryResponseAction.SESSIONS_REVOKED]: "warning",
};

/**
 * Read-only view of the append-only access-control audit trail: every role
 * grant/revoke, suspension, reactivation and forced logout, newest first. There
 * is no edit or delete — the backend exposes no such endpoint. Each row links to
 * "Manage Account" pre-filled with the affected account.
 */
export default function SecurityAuditPage() {
  const { data, isLoading } = useListAudit();

  const rows = useMemo(
    () =>
      (data?.data ?? []).map((entry, index) => ({
        id: entry.auditId ?? String(index),
        createdAt: entry.createdAt
          ? new Date(entry.createdAt).toLocaleString()
          : "—",
        action: entry.action ?? "",
        actor: entry.actorName ?? entry.actorId ?? "—",
        target: entry.targetName ?? entry.targetId ?? "—",
        targetId: entry.targetId ?? "",
        change:
          entry.fromValue || entry.toValue
            ? `${entry.fromValue ?? "—"} → ${entry.toValue ?? "—"}`
            : "—",
        reason: entry.reason ?? "",
      })),
    [data]
  );

  const columns: GridColDef[] = [
    { field: "createdAt", headerName: "When", width: 160 },
    {
      field: "action",
      headerName: "Action",
      width: 160,
      renderCell: (params) => (
        <Chip
          size="small"
          label={String(params.value)}
          color={ACTION_COLOR[String(params.value)] ?? "default"}
          variant="outlined"
        />
      ),
    },
    { field: "actor", headerName: "By (security admin)", flex: 1, minWidth: 130 },
    { field: "target", headerName: "Target", flex: 1, minWidth: 130 },
    { field: "change", headerName: "Change", width: 130 },
    { field: "reason", headerName: "Reason", flex: 2, minWidth: 150 },
    {
      field: "manage",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.targetId ? (
          <Button
            size="small"
            component={Link}
            href={`/security/account?userId=${params.row.targetId}`}
          >
            Manage
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit Trail"
        subtitle="Append-only record of every identity action. Nobody — security admin included — can edit or delete an entry."
      />

      <Panel title={`Entries (${rows.length})`}>
        <DataTable rows={rows} columns={columns} loading={isLoading} height={560} />
      </Panel>
    </>
  );
}
