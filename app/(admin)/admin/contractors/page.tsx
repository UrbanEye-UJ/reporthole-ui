"use client";

import { Button, Grid } from "@mui/material";

import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";

import DataTable from "../../_components/tables/DataTable";
import StatusBadge, { type Status } from "../../_components/ui/StatusBadge";

import type { GridColDef } from "@mui/x-data-grid";

// TODO(api): replace with data from GET /admin/contractors (paginated)
// Expected shape: { id: number; contractor: string; district: string; activeJobs: number; completion: string; status: string }[]
// Also needed: POST /admin/contractors, PUT /admin/contractors/{id}, DELETE /admin/contractors/{id},
//              GET /admin/contractors/{id}/performance, PATCH /admin/contractors/{id}/availability
const rows = [
  {
    id: 1,
    contractor: "RoadFix SA",
    district: "Johannesburg",
    activeJobs: 18,
    completion: "91%",
    status: "In Progress",
  },
  {
    id: 2,
    contractor: "Metro Infrastructure",
    district: "Pretoria",
    activeJobs: 12,
    completion: "82%",
    status: "Assigned",
  },
  {
    id: 3,
    contractor: "Urban Civil Works",
    district: "Ekurhuleni",
    activeJobs: 9,
    completion: "74%",
    status: "Open",
  },
];

const columns: GridColDef[] = [
  {
    field: "contractor",
    headerName: "Contractor",
    flex: 1,
  },
  {
    field: "district",
    headerName: "District",
    flex: 1,
  },
  {
    field: "activeJobs",
    headerName: "Active Jobs",
    width: 140,
  },
  {
    field: "completion",
    headerName: "Completion",
    width: 130,
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => (
      <StatusBadge status={params.value as Status} />
    ),
  },
];

export default function ContractorsPage() {
  return (
    <>
      <PageHeader
        title="Contractors"
        subtitle="Manage contractors responsible for road maintenance."
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
          >
            Add Contractor
          </Button>
        }
      />

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Registered Contractors"
            value="28"
            icon={<EngineeringRoundedIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Active Contracts"
            value="76"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Completed Repairs"
            value="1,284"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Average SLA"
            value="94%"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Contractor Overview">
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
