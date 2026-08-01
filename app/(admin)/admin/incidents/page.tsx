"use client";

import { useState } from "react";

import {
  Button,
  Stack,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";

import PageHeader from "../../_components/ui/PageHeader";
import Panel from "../../_components/ui/Panel";

import TableToolbar from "../../_components/tables/TableToolbar";
import TableSearch from "../../_components/tables/TableSearch";
import TableFilters from "../../_components/tables/TableFilters";
import DataTable from "../../_components/tables/DataTable";

import StatusBadge from "../../_components/ui/StatusBadge";

import type { GridColDef } from "@mui/x-data-grid";

// TODO(api): replace with data from GET /admin/incidents (paginated)
// Expected shape: { id: number; road: string; district: string; severity: string; status: string }[]
// Also needed: PATCH /admin/incidents/{id}/status, PATCH /admin/incidents/{id}/assign,
//              PUT /admin/incidents/{id}, DELETE /admin/incidents/{id}
const rows = [
  {
    id: 1,
    road: "N1 North",
    district: "Johannesburg",
    severity: "Critical",
    status: "Open",
  },
  {
    id: 2,
    road: "R21",
    district: "Pretoria",
    severity: "High",
    status: "Assigned",
  },
  {
    id: 3,
    road: "N3",
    district: "Ekurhuleni",
    severity: "Medium",
    status: "In Progress",
  },
  {
    id: 4,
    road: "M2",
    district: "Johannesburg",
    severity: "Low",
    status: "Resolved",
  },
];

const columns: GridColDef[] = [
  {
    field: "road",
    headerName: "Road",
    flex: 1,
  },
  {
    field: "district",
    headerName: "District",
    flex: 1,
  },
  {
    field: "severity",
    headerName: "Severity",
    width: 130,
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => (
      <StatusBadge status={params.value as any} />
    ),
  },
];

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="Manage and monitor reported road incidents across Gauteng."
      />

      <Panel>
        <TableToolbar
          title="Incident Register"
          total={rows.length}
          leftContent={
            <Stack
              direction="row"
              spacing={2}
            >
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search incidents..."
              />

              <TableFilters
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  "All",
                  "Open",
                  "Assigned",
                  "In Progress",
                  "Resolved",
                ]}
              />
            </Stack>
          }
          rightContent={
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              New Incident
            </Button>
          }
        />

        <DataTable
          rows={rows}
          columns={columns}
          height={650}
        />
      </Panel>
    </>
  );
}
