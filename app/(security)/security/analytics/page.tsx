"use client";

import { useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  type SelectChangeEvent,
} from "@mui/material";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import { PageHeader, Panel, MetricCard } from "../../_components/ui";
import TopContractors from "../../_components/TopContractors";
import AreaChart from "../../_components/charts/AreaChart";
import BarChart from "../../_components/charts/BarChart";
import DoughnutChart from "../../_components/charts/DoughnutChart";
import ChartLine from "../../_components/charts/ChartLine";

import { useList } from "@/app/api/generated/municipalities/municipalities";
import { useGetContractors } from "@/app/api/generated/admin-contractors/admin-contractors";
import { useGetIncidentAnalytics } from "@/lib/hooks/useIncidentAnalytics";
import { exportElementToPdf } from "@/lib/exportElementToPdf";

const ALL_MUNICIPALITIES = "all";
const TYPE_COLORS = ["#4F8CFF", "#F59E0B", "#EF4444", "#22C55E", "#A855F7", "#06B6D4", "#F97316", "#EC4899"];

const formatLabel = (value?: string) =>
  value ? value.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "Unknown";

const formatHours = (hours?: number) =>
  hours == null ? "—" : hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;

/**
 * Platform-wide analytics for SECURITY_ADMIN — same real-data story as the operational admin
 * dashboard's analytics page, but with no municipality lock: defaults to everything, filterable
 * down to one municipality at a time via the selector below.
 */
export default function SecurityAnalyticsPage() {
  const [municipalityId, setMunicipalityId] = useState<string>(ALL_MUNICIPALITIES);
  const effectiveMunicipalityId = municipalityId === ALL_MUNICIPALITIES ? undefined : municipalityId;

  const { data: municipalitiesData } = useList();
  const municipalities = municipalitiesData?.data ?? [];

  const { data: analytics } = useGetIncidentAnalytics(effectiveMunicipalityId);
  const { data: contractorsData } = useGetContractors(
    effectiveMunicipalityId ? { municipalityId: effectiveMunicipalityId } : undefined,
  );
  const contractors = contractorsData?.data ?? [];

  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const selectedMunicipalityName =
    municipalityId === ALL_MUNICIPALITIES
      ? "All Municipalities"
      : (municipalities.find((m) => m.id === municipalityId)?.name ?? "Selected municipality");

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      await exportElementToPdf(contentRef.current, {
        fileName: `incident-analytics-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: "Incident Analytics Report",
        subtitle: "Operational performance across every municipality.",
        metaLines: [`Municipality: ${selectedMunicipalityName}`, `Generated ${new Date().toLocaleString()}`],
      });
    } catch (error) {
      console.error("Failed to export analytics PDF", error);
      setExportError(true);
    } finally {
      setIsExporting(false);
    }
  };

  const monthlyTrend = (analytics?.monthlyTrend ?? []).map((e) => ({
    month: e.month ?? "",
    count: e.count ?? 0,
  }));
  const resolutionTimeTrend = (analytics?.resolutionTimeTrend ?? []).map((e) => ({
    month: e.month ?? "",
    avgHours: e.avgHours ?? null,
  }));
  const typeBreakdown = (analytics?.typeBreakdown ?? []).map((e, i) => ({
    name: formatLabel(e.type),
    value: e.count ?? 0,
    color: TYPE_COLORS[i % TYPE_COLORS.length],
  }));
  const statusBreakdown = (analytics?.statusBreakdown ?? []).map((e) => ({
    label: formatLabel(e.status),
    count: e.count ?? 0,
  }));

  const handleMunicipalityChange = (event: SelectChangeEvent) => setMunicipalityId(event.target.value);

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Operational performance across every municipality — filter down to inspect one."
        actions={
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="analytics-municipality-label">Municipality</InputLabel>
              <Select
                labelId="analytics-municipality-label"
                label="Municipality"
                value={municipalityId}
                onChange={handleMunicipalityChange}
              >
                <MenuItem value={ALL_MUNICIPALITIES}>All Municipalities</MenuItem>
                {municipalities.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<PictureAsPdfRoundedIcon />}
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              {isExporting ? "Preparing PDF…" : "Download PDF"}
            </Button>
          </Box>
        }
      />

      <Box ref={contentRef}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard title="Total Incidents" value={analytics?.totalIncidents ?? 0} icon={<ReportRoundedIcon />} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard title="Resolved" value={analytics?.resolvedIncidents ?? 0} icon={<CheckCircleRoundedIcon />} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard title="Open / In Progress" value={analytics?.openIncidents ?? 0} icon={<PendingActionsRoundedIcon />} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <MetricCard title="Avg. Resolution Time" value={formatHours(analytics?.avgResolutionHours)} icon={<TimerRoundedIcon />} />
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Panel title="Monthly Incident Trend">
              <AreaChart data={monthlyTrend} />
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Panel title="Incidents by Type">
              <DoughnutChart data={typeBreakdown} />
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Panel title="Status Funnel">
              <BarChart data={statusBreakdown} />
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Panel title="Resolution Time Trend">
              <ChartLine data={resolutionTimeTrend} />
            </Panel>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TopContractors contractors={contractors} />
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={exportError} autoHideDuration={5000} onClose={() => setExportError(false)}>
        <Alert severity="error" onClose={() => setExportError(false)}>
          Failed to generate the PDF. Please try again.
        </Alert>
      </Snackbar>
    </>
  );
}
