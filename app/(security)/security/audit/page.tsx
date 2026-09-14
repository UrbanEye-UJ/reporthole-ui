"use client";

import { useMemo } from "react";
import Link from "next/link";

import { Button, Chip } from "@mui/material";

import { PageHeader, Panel } from "../../_components/ui";
import DataTable from "../../_components/DataTable";

import { useListAudit, useListAuditLog } from "@/app/api/generated/security-admin/security-admin";
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
  PII_REVEALED: "info",
  CONTRACTOR_INVITED: "success",
  MUNICIPALITY_CREATED: "success",
  MUNICIPALITY_TOKEN_ISSUED: "success",
  MUNICIPALITY_TOKEN_REVOKED: "warning",
  ADMIN_APPLICATION_REJECTED: "warning",
  SPECIALISATIONS_UPDATED: "default",
  COMMENT_POSTED: "default",
  MESSAGE_SENT: "default",
  CONTACT_FORM_SUBMITTED: "default",
};

interface Row {
  id: string;
  sortKey: number;
  createdAt: string;
  action: string;
  actor: string;
  target: string;
  change: string;
  detail: string;
  targetUserId: string;
}

/**
 * Read-only view of every recorded state-changing action, newest first — merges two
 * append-only backend sources into one table:
 *   - the identity/accountability trail (role grants/revokes, suspensions, forced logout,
 *     PII reveals) where actor and target are both accounts, each row linking to
 *     "Manage Account" pre-filled with the affected account; and
 *   - the general audit log (municipality/token management, contractor invites, admin
 *     application decisions, specialisation changes, comments, messages) for actions that
 *     don't have a user "target" to manage.
 * Neither source has an edit or delete endpoint — the backend exposes none.
 */
export default function SecurityAuditPage() {
  const { data: identityData, isLoading: identityLoading } = useListAudit();
  const { data: generalData, isLoading: generalLoading } = useListAuditLog();

  const rows = useMemo(() => {
    const identityRows: Row[] = (identityData?.data ?? []).map((entry, index) => ({
      id: `identity-${entry.auditId ?? index}`,
      sortKey: entry.createdAt ? new Date(entry.createdAt).getTime() : 0,
      createdAt: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—",
      action: entry.action ?? "",
      actor: entry.actorName ?? entry.actorId ?? "—",
      target: entry.targetName ?? entry.targetId ?? "—",
      change:
        entry.fromValue || entry.toValue
          ? `${entry.fromValue ?? "—"} → ${entry.toValue ?? "—"}`
          : "—",
      detail: entry.reason ?? "—",
      targetUserId: entry.targetId ?? "",
    }));

    const generalRows: Row[] = (generalData?.data ?? []).map((entry, index) => ({
      id: `general-${entry.id ?? index}`,
      sortKey: entry.createdAt ? new Date(entry.createdAt).getTime() : 0,
      createdAt: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "—",
      action: entry.action ?? "",
      actor: entry.actorName ?? entry.actorId ?? "System",
      target: entry.entityType ?? "—",
      change: "—",
      detail: entry.summary ?? "—",
      targetUserId: "",
    }));

    return [...identityRows, ...generalRows].sort((a, b) => b.sortKey - a.sortKey);
  }, [identityData, generalData]);

  const columns: GridColDef[] = [
    { field: "createdAt", headerName: "When", width: 160 },
    {
      field: "action",
      headerName: "Action",
      width: 190,
      renderCell: (params) => (
        <Chip
          size="small"
          label={String(params.value)}
          color={ACTION_COLOR[String(params.value)] ?? "default"}
          variant="outlined"
        />
      ),
    },
    { field: "actor", headerName: "By", flex: 1, minWidth: 130 },
    { field: "target", headerName: "Target", flex: 1, minWidth: 130, filterable: false },
    { field: "change", headerName: "Change", width: 130, filterable: false },
    { field: "detail", headerName: "Detail / Reason", flex: 2, minWidth: 180, filterable: false },
    {
      field: "manage",
      headerName: "",
      width: 90,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.targetUserId ? (
          <Button
            size="small"
            component={Link}
            href={`/security/account?userId=${params.row.targetUserId}`}
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
        subtitle="Append-only record of every state-changing action on the platform. Nobody — security admin included — can edit or delete an entry."
      />

      <Panel title={`Entries (${rows.length})`}>
        <DataTable rows={rows} columns={columns} loading={identityLoading || generalLoading} height={560} toolbar />
      </Panel>
    </>
  );
}
