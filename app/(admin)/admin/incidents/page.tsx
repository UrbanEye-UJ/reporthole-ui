"use client";

import { useMemo, useState } from "react";

import {
  Button,
  Stack,
} from "@mui/material";

import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";

import PageHeader from "../../_components/ui/PageHeader";
import Panel from "../../_components/ui/Panel";

import TableToolbar from "../../_components/tables/TableToolbar";
import TableSearch from "../../_components/tables/TableSearch";
import TableFilters from "../../_components/tables/TableFilters";
import DataTable from "../../_components/tables/DataTable";
import { incidentColumns, formatIncidentType, STATUS_MAP } from "../../_components/tables/incidentColumns";
import AssignIncidentModal from "../../_components/incidents/AssignIncidentModal";

import { useGetRecentIncidents, type AssignmentStatus } from "@/lib/hooks/useRecentIncidents";

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const { data, isLoading } = useGetRecentIncidents(100);
  const rows = useMemo(
    () => (data?.data ?? []).map((incident) => ({ id: incident.incidentId, ...incident })),
    [data]
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !keyword ||
        row.locationAddress?.toLowerCase().includes(keyword) ||
        formatIncidentType(row.incidentType).toLowerCase().includes(keyword);
      const rowStatus = STATUS_MAP[row.status as AssignmentStatus] ?? "Open";
      const matchesStatus = status === "All" || rowStatus === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const incidentOptions = useMemo(
    () =>
      rows
        .filter((row): row is typeof row & { incidentId: string } => !!row.incidentId)
        .map((row) => ({
          incidentId: row.incidentId,
          label: `${formatIncidentType(row.incidentType)} — ${row.locationAddress || "Unknown location"}`,
        })),
    [rows]
  );

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="Manage and monitor reported road incidents across Gauteng."
      />

      <Panel>
        <TableToolbar
          title="Incident Register"
          total={filteredRows.length}
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
              startIcon={<AssignmentIndRoundedIcon />}
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Incident
            </Button>
          }
        />

        <DataTable
          rows={filteredRows}
          columns={incidentColumns}
          loading={isLoading}
          height={650}
        />
      </Panel>

      <AssignIncidentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incidents={incidentOptions}
      />
    </>
  );
}
