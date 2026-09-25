"use client";

import { useRef, useState } from "react";

import { Alert, Box, Button, Grid, Snackbar } from "@mui/material";

import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";

import AreaChart from "../../_components/charts/AreaChart";
import BarChart from "../../_components/charts/BarChart";
import DoughnutChart from "../../_components/charts/DoughnutChart";
import ChartLine from "../../_components/charts/ChartLine";
import TopContractors from "../../_components/dashboard/TopContractors";

import { formatIncidentType } from "../../_components/tables/incidentColumns";
import { useGetIncidentAnalytics } from "@/lib/hooks/useIncidentAnalytics";
import { useGetContractors } from "@/app/api/generated/admin-contractors/admin-contractors";
import { exportElementToPdf } from "@/lib/exportElementToPdf";

const TYPE_COLORS = ["#4F8CFF", "#F59E0B", "#EF4444", "#22C55E", "#A855F7", "#06B6D4", "#F97316", "#EC4899"];

const formatHours = (hours?: number) =>
  hours == null ? "—" : hours < 1 ? `${Math.round(hours * 60)}m` : `${hours.toFixed(1)}h`;

/**
 * Analytics — every figure and chart is derived from real, already-recorded data
 * (incidents, assignment workflow history, and contractor job counts); nothing here
 * is mocked or estimated.
 */
export default function AnalyticsPage() {
  const { data: analytics } = useGetIncidentAnalytics();
  const { data: contractorsData } = useGetContractors();
  const contractors = contractorsData?.data ?? [];

  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      await exportElementToPdf(contentRef.current, {
        fileName: `incident-analytics-${new Date().toISOString().slice(0, 10)}.pdf`,
        title: "Incident Analytics Report",
        subtitle: "Operational performance for your municipality.",
        metaLines: [`Generated ${new Date().toLocaleString()}`],
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
    name: formatIncidentType(e.type),
    value: e.count ?? 0,
    color: TYPE_COLORS[i % TYPE_COLORS.length],
  }));
  const statusBreakdown = (analytics?.statusBreakdown ?? []).map((e) => ({
    label: formatIncidentType(e.status),
    count: e.count ?? 0,
  }));

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Operational performance for your municipality."
        actions={
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? "Preparing PDF…" : "Download PDF"}
          </Button>
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
