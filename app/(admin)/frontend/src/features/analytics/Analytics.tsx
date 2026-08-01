import { Grid } from "@mui/material";

import PageHeader from "../../components/ui/PageHeader";
import MetricCard from "../../components/ui/MetricCard";
import Panel from "../../components/ui/Panel";

import AreaChart from "../../components/charts/AreaChart";
import BarChart from "../../components/charts/BarChart";
import LineChart from "../../components/charts/ChartLine";
import DoughnutChart from "../../components/charts/DoughnutChart";

const Analytics = () => {
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="AI insights and operational performance across Gauteng."
      />

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Incidents This Month"
            value="2,348"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Resolved"
            value="1,987"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="Average Response"
            value="2.8 hrs"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            title="AI Accuracy"
            value="98.4%"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel title="Monthly Incident Trend">
            <AreaChart />
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Panel title="Severity Distribution">
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
};

export default Analytics;