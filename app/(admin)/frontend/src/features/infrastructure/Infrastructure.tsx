import {
  Grid,
  Button,
} from "@mui/material";

import AddRoadRoundedIcon from "@mui/icons-material/AddRoadRounded";

import PageHeader from "../../components/ui/PageHeader";
import Panel from "../../components/ui/Panel";
import MetricCard from "../../components/ui/MetricCard";

import GautengMap from "../../components/map/GautengMap";

const Infrastructure = () => {
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
};

export default Infrastructure;