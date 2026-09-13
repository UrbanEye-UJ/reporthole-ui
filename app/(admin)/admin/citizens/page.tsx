"use client";

import { useMemo } from "react";

import { Chip, Grid } from "@mui/material";

import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

import type { GridColDef } from "@mui/x-data-grid";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";
import DataTable from "../../_components/tables/DataTable";

import { useGetCivilians } from "@/app/api/generated/admin-users/admin-users";
import type { CivilianSummaryResponseStatus } from "@/app/api/generated/openAPIDefinition.schemas";

export default function CiviliansPage() {
  const { data, isLoading } = useGetCivilians();

  const civilians = useMemo(() => data?.data ?? [], [data]);

  const rows = useMemo(
    () =>
      civilians.map((u) => ({
        id: u.userId,
        maskedName: u.maskedName ?? "—",
        maskedEmail: u.maskedEmail ?? "—",
        incidentCount: u.incidentCount ?? 0,
        status: u.status,
        memberSince: u.createdAt,
      })),
    [civilians]
  );

  const columns: GridColDef[] = [
    {
      field: "maskedName",
      headerName: "Civilian",
      flex: 1,
    },
    {
      field: "maskedEmail",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "incidentCount",
      headerName: "Reports",
      width: 110,
      type: "number",
    },
    {
      field: "memberSince",
      headerName: "Joined",
      width: 160,
      valueFormatter: (value: string) =>
        value
          ? new Date(value).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      field: "status",
      headerName: "Account Status",
      width: 170,
      renderCell: (params) => {
        const s = params.value as CivilianSummaryResponseStatus;
        if (s === "SUSPENDED") return <Chip label="Suspended" color="error" size="small" />;
        if (s === "PENDING_VERIFICATION") return <Chip label="Pending" color="warning" size="small" />;
        return <Chip label="Active" color="success" size="small" variant="outlined" />;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Civilians"
        subtitle="Registered civilian reporters — names and emails are partially masked."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Registered Civilians"
            value={civilians.length || "—"}
            icon={<PeopleRoundedIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Active"
            value={civilians.filter((u) => u.status === "ACTIVE").length || "—"}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Pending Verification"
            value={civilians.filter((u) => u.status === "PENDING_VERIFICATION").length || "—"}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Civilian Directory">
            <DataTable
              rows={rows}
              columns={columns}
              loading={isLoading}
              height={520}
            />
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
