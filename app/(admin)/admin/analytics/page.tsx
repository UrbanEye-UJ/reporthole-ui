"use client";

import { Grid } from "@mui/material";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";

import AreaChart from "../../_components/charts/AreaChart";
import BarChart from "../../_components/charts/BarChart";
import LineChart from "../../_components/charts/ChartLine";
import DoughnutChart from "../../_components/charts/DoughnutChart";

import { useGetIncidentStats } from "@/lib/hooks/useIncidentStats";

/**
 * Analytics — KPI cards use real data from /incidents/stats;
 * charts use illustrative data until a time-series endpoint is available.
 */
export default function AnalyticsPage() {
  const { data: statsData } = useGetIncidentStats();
  const stats = statsData?.data;

  const total = stats?.totalIncidents ?? "—";
  const resolved = stats?.resolvedIncidents ?? "—";
  const inProgress =
    stats != null
      ? stats.totalIncidents - stats.resolvedIncidents
      : "—";

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Operational performance across the Gauteng road network."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Total Incidents" value={total} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Resolved" value={resolved} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard title="Open / In Progress" value={inProgress} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {/* Average response time requires a dedicated aggregation endpoint — placeholder for now */}
          <MetricCard title="Avg. Response Time" value="—" />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel title="Monthly Incident Trend">
            <AreaChart />
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Panel title="Incidents by Type">
            <DoughnutChart />
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Panel title="Incidents by District">
            <BarChart />
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Panel title="Response Time Trend">
            <LineChart />
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
