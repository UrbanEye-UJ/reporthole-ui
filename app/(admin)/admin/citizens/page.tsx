"use client";

import { Grid } from "@mui/material";

import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

import type { GridColDef } from "@mui/x-data-grid";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";
import DataTable from "../../_components/tables/DataTable";
import StatusBadge from "../../_components/ui/StatusBadge";

// TODO(api): replace with data from GET /admin/users?role=CIVILIAN
// Expected shape: { id: number; name: string; district: string; reports: number; status: string }[]
// where status reflects the latest report status for that user
const rows = [
  {
    id: 1,
    name: "John Mokoena",
    district: "Johannesburg",
    reports: 14,
    status: "Resolved",
  },
  {
    id: 2,
    name: "Sarah Nkosi",
    district: "Pretoria",
    reports: 8,
    status: "In Progress",
  },
  {
    id: 3,
    name: "David Molefe",
    district: "Ekurhuleni",
    reports: 5,
    status: "Assigned",
  },
  {
    id: 4,
    name: "Lebo Khumalo",
    district: "Soweto",
    reports: 11,
    status: "Open",
  },
];

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Citizen",
    flex: 1,
  },
  {
    field: "district",
    headerName: "District",
    flex: 1,
  },
  {
    field: "reports",
    headerName: "Reports Submitted",
    width: 170,
  },
  {
    field: "status",
    headerName: "Latest Report",
    width: 170,
    renderCell: (params) => (
      <StatusBadge status={params.value as any} />
    ),
  },
];

export default function CitizensPage() {
  return (
    <>
      <PageHeader
        title="Citizens"
        subtitle="Manage citizen engagement and road issue reporting."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Registered Citizens"
            value="12,548"
            icon={<PeopleRoundedIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Reports Submitted"
            value="4,386"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Active Reporters"
            value="932"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Average Rating"
            value="4.8 ★"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Citizen Directory">
            <DataTable
              rows={rows}
              columns={columns}
              height={520}
            />
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
