"use client";

import { useMemo, useState } from "react";

import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";

import PageHeader from "../../_components/ui/PageHeader";
import Panel from "../../_components/ui/Panel";

import TableToolbar from "../../_components/tables/TableToolbar";
import TableSearch from "../../_components/tables/TableSearch";
import TableFilters from "../../_components/tables/TableFilters";
import DataTable from "../../_components/tables/DataTable";
import { incidentColumns, formatIncidentType, STATUS_MAP } from "../../_components/tables/incidentColumns";
import AssignIncidentModal from "../../_components/incidents/AssignIncidentModal";
import IncidentDetailDrawer from "../../_components/incidents/IncidentDetailDrawer";
import AiReviewPanel from "../../_components/incidents/AiReviewPanel";

import { useGetRecentIncidents, type AssignmentStatus, type IncidentWithStatus } from "@/lib/hooks/useRecentIncidents";

type SourceFilter = "All" | "Manual" | "AI Detected";

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState<SourceFilter>("All");
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailIncident, setDetailIncident] = useState<IncidentWithStatus | null>(null);

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
      const matchesSource =
        source === "All" ||
        (source === "AI Detected" && row.source === "DASHCAM") ||
        (source === "Manual" && row.source !== "DASHCAM");
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [rows, search, status, source]);

  const incidentOptions = useMemo(
    () =>
      rows
        .filter((row): row is typeof row & { incidentId: string } => !!row.incidentId)
        .map((row) => ({
          incidentId: row.incidentId,
          label: `${formatIncidentType(row.incidentType)} — ${row.locationAddress || "Unknown location"}`,
          issueType: row.incidentType,
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
            <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
              <TableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search incidents..."
              />

              <TableFilters
                label="Status"
                value={status}
                onChange={setStatus}
                options={["All", "Open", "Assigned", "In Progress", "Resolved"]}
              />
            </Stack>
          }
          rightContent={
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {/* Source filter — "AI Detected" also surfaces the review queue below */}
              <ToggleButtonGroup
                value={source}
                exclusive
                onChange={(_, val) => { if (val) setSource(val as SourceFilter); }}
                size="small"
              >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Manual">Manual</ToggleButton>
                <ToggleButton value="AI Detected">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <SmartToyRoundedIcon fontSize="inherit" />
                    AI Detected
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>

              <Button
                variant="contained"
                startIcon={<AssignmentIndRoundedIcon />}
                onClick={() => setAssignModalOpen(true)}
              >
                Assign Incident
              </Button>
            </Stack>
          }
        />

        <DataTable
          rows={filteredRows}
          columns={incidentColumns}
          loading={isLoading}
          height={650}
          onRowClick={(params) => setDetailIncident(params.row as IncidentWithStatus)}
        />
      </Panel>

      {/* AI review queue — only visible when the "AI Detected" source filter is active */}
      {source === "AI Detected" && (
        <Box sx={{ mt: 3 }}>
          <AiReviewPanel />
        </Box>
      )}

      <AssignIncidentModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incidents={incidentOptions}
      />

      <IncidentDetailDrawer
        incident={detailIncident}
        onClose={() => setDetailIncident(null)}
      />
    </>
  );
}
