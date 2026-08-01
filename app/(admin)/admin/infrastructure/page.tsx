"use client";

import {
  Grid,
  Button,
} from "@mui/material";

import AddRoadRoundedIcon from "@mui/icons-material/AddRoadRounded";

import PageHeader from "../../_components/ui/PageHeader";
import Panel from "../../_components/ui/Panel";
import MetricCard from "../../_components/ui/MetricCard";
import GautengMap from "../../_components/map/GautengMap";

// TODO(api): KPI values from GET /admin/infrastructure/stats (if endpoint created)
// Map markers from GET /admin/infrastructure/assets
// Expected asset shape: { id: number; name: string; type: string; latitude: number; longitude: number }
export default function InfrastructurePage() {
  return (
    <>
      <PageHeader
        title="Infrastructure"
        subtitle="Monitor and manage road assets across Gauteng."
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoadRoundedIcon />}
          >
            Add Road Asset
          </Button>
        }
      />

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Road Segments"
            value="3,248"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Bridges"
            value="142"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Traffic Signals"
            value="586"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Maintenance Zones"
            value="37"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Infrastructure Map">
            <GautengMap />
          </Panel>
        </Grid>
      </Grid>
    </>
  );
}
