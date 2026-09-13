"use client";

import { Grid } from "@mui/material";

import PageHeader from "../../_components/ui/PageHeader";
import Panel from "../../_components/ui/Panel";
import MetricCard from "../../_components/ui/MetricCard";
import GautengMap from "../../_components/map/GautengMap";

import { useGetIncidentStats } from "@/lib/hooks/useIncidentStats";

/**
 * District Overview — shows the geographic spread of incidents across Gauteng
 * alongside real platform-wide counts pulled from /incidents/stats.
 */
export default function DistrictOverviewPage() {
  const { data: statsData } = useGetIncidentStats();
  const stats = statsData?.data;

  const total = stats?.totalIncidents ?? "—";
  const resolved = stats?.resolvedIncidents ?? "—";
  const open =
    stats != null
      ? stats.totalIncidents - stats.resolvedIncidents
      : "—";

  return (
    <>
      <PageHeader
        title="District Overview"
        subtitle="Geographic distribution of reported incidents across Gauteng."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard title="Total Incidents" value={total} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard title="Open / Unresolved" value={open} />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard title="Resolved" value={resolved} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Incident Map — Gauteng">
            <GautengMap />
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
