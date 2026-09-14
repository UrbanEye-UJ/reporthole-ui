"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import GrainRoundedIcon from "@mui/icons-material/GrainRounded";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";

import { PageHeader, Panel } from "../../_components/ui";
import DataTable from "../../_components/DataTable";
import { useList } from "@/app/api/generated/municipalities/municipalities";
import { useSearchIncidents } from "@/app/api/generated/incidents/incidents";
import { SearchIncidentsType } from "@/app/api/generated/openAPIDefinition.schemas";
import type { SecurityMapView } from "../../_components/SecurityIncidentMap";

const ALL_MUNICIPALITIES = "all";
const ALL_TYPES = "all";
const PAGE_SIZE = 50;

const formatIncidentType = (type?: string) =>
  type
    ? type.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    : "Unknown";

const STATUS_COLOR: Record<string, "default" | "warning" | "info" | "success" | "error"> = {
  REPORTED: "error",
  VERIFIED: "warning",
  ASSIGNED: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

const SecurityIncidentMap = dynamic(() => import("../../_components/SecurityIncidentMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "600px", borderRadius: "16px", background: "rgba(127,127,127,.08)" }} />
  ),
});

/**
 * Platform-wide incident map and table for SECURITY_ADMIN — unlike the operational admin
 * dashboard's map (auto-scoped to one admin's own municipality), this lets the security admin
 * inspect every municipality at once or drill into one, filter by issue type, and browse the
 * full filtered set as a paginated table (the map alone can't show more than a screenful of
 * pins/clusters legibly).
 */
export default function SecurityIncidentsPage() {
  const [municipalityId, setMunicipalityId] = useState<string>(ALL_MUNICIPALITIES);
  const [issueType, setIssueType] = useState<string>(ALL_TYPES);
  const [view, setView] = useState<SecurityMapView>("pins");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: PAGE_SIZE });

  const { data: municipalitiesData, isLoading: municipalitiesLoading } = useList();
  const municipalities = municipalitiesData?.data ?? [];
  const selectedBoundary = municipalities.find((m) => m.id === municipalityId)?.boundary;

  const effectiveMunicipalityId = municipalityId === ALL_MUNICIPALITIES ? undefined : municipalityId;
  const effectiveIssueType = issueType === ALL_TYPES ? undefined : (issueType as SearchIncidentsType);

  const { data: pageData, isLoading: incidentsLoading } = useSearchIncidents({
    municipalityId: effectiveMunicipalityId,
    type: effectiveIssueType,
    page: paginationModel.page,
    size: paginationModel.pageSize,
  });
  const page = pageData?.data;

  const handleMunicipalityChange = (event: SelectChangeEvent) => {
    setMunicipalityId(event.target.value);
    setPaginationModel((m) => ({ ...m, page: 0 }));
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setIssueType(event.target.value);
    setPaginationModel((m) => ({ ...m, page: 0 }));
  };

  const rows = useMemo(
    () =>
      (page?.content ?? []).map((incident) => ({
        id: incident.incidentId ?? "",
        type: incident.incidentType ?? "",
        location: incident.locationAddress ?? "—",
        status: incident.status ?? "REPORTED",
        reporterCount: incident.reporterCount ?? 1,
        date: incident.incidentDate ? new Date(incident.incidentDate).toLocaleDateString("en-ZA") : "—",
      })),
    [page]
  );

  const columns: GridColDef[] = [
    {
      field: "type",
      headerName: "Type",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => formatIncidentType(String(params.value)),
    },
    { field: "location", headerName: "Location", flex: 1.5, minWidth: 200 },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <Chip
          size="small"
          variant="outlined"
          label={String(params.value)}
          color={STATUS_COLOR[String(params.value)] ?? "default"}
        />
      ),
    },
    { field: "reporterCount", headerName: "Reporters", width: 110 },
    { field: "date", headerName: "Reported", width: 130 },
  ];

  return (
    <>
      <PageHeader
        title="Incidents"
        subtitle="Incident locations, hotspots, and the full filtered list across every municipality on the platform."
      />

      <Panel>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="incidents-municipality-label">Municipality</InputLabel>
              <Select
                labelId="incidents-municipality-label"
                label="Municipality"
                value={municipalityId}
                onChange={handleMunicipalityChange}
                disabled={municipalitiesLoading}
              >
                <MenuItem value={ALL_MUNICIPALITIES}>All municipalities</MenuItem>
                {municipalities.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="incidents-type-label">Issue type</InputLabel>
              <Select
                labelId="incidents-type-label"
                label="Issue type"
                value={issueType}
                onChange={handleTypeChange}
              >
                <MenuItem value={ALL_TYPES}>All types</MenuItem>
                {Object.values(SearchIncidentsType).map((t) => (
                  <MenuItem key={t} value={t}>{formatIncidentType(t)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => { if (v) setView(v); }}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 2,
                py: 0.75,
                fontSize: "0.75rem",
                fontWeight: 600,
                borderRadius: "8px !important",
                border: "1px solid",
                borderColor: "divider",
                textTransform: "none",
              },
            }}
          >
            <ToggleButton value="pins">
              <LocationOnRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Incidents
            </ToggleButton>
            <ToggleButton value="clusters">
              <GrainRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
              K-Clusters
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <SecurityIncidentMap
          view={view}
          municipalityId={effectiveMunicipalityId}
          boundary={municipalityId === ALL_MUNICIPALITIES ? undefined : selectedBoundary}
          issueType={effectiveIssueType}
        />
      </Panel>

      <Box sx={{ mt: 3 }}>
        <Panel title={`Incidents (${page?.totalElements ?? 0})`}>
          <DataTable
            rows={rows}
            columns={columns}
            loading={incidentsLoading}
            height={520}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={page?.totalElements ?? 0}
          />
        </Panel>
      </Box>
    </>
  );
}
