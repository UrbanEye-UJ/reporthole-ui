import {
  Grid,
} from "@mui/material";

import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import MetricCard from "../../components/ui/MetricCard";
import PageHeader from "../../components/ui/PageHeader";

import AISummary from "./components/AISummary";
import IncidentMap from "./components/IncidentMap";
import RecentIncidents from "./components/RecentIncidents";
import RepairProgress from "./components/RepairProgress";
import SeverityChart from "./components/SeverityChart";


const OperationsCenter = () => {
  return (
    <>
      <PageHeader
        title="Operations Center"
        subtitle="Real-time monitoring of Gauteng road infrastructure."
      />

      <Grid
        container
        spacing={3}
      >
        {/* KPI Cards */}

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <MetricCard
            title="Total Incidents"
            value="2,847"
            trend={12}
            trendLabel="this week"
            icon={<ReportRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <MetricCard
            title="Critical Roads"
            value="184"
            trend={-5}
            trendLabel="today"
            color="#EF4444"
            icon={<WarningAmberRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <MetricCard
            title="Active Contractors"
            value="74"
            trend={6}
            trendLabel="online"
            color="#22C55E"
            icon={<EngineeringRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
          <MetricCard
            title="Repairs Completed"
            value="1,982"
            trend={15}
            trendLabel="this month"
            color="#38BDF8"
            icon={<CheckCircleRoundedIcon />}
          />
        </Grid>

        {/* Map */}

        <Grid size={{ xs: 12, lg: 8 }}>
          <IncidentMap />
        </Grid>

        {/* AI */}

        <Grid size={{ xs: 12, lg: 4 }}>
          <AISummary />
        </Grid>

        {/* Recent */}

        <Grid size={{ xs: 12, lg: 8 }}>
          <RecentIncidents />
        </Grid>

        {/* Severity */}

        <Grid size={{ xs: 12, lg: 4 }}>
          <SeverityChart />
        </Grid>

        {/* Progress */}

        <Grid size={12}>
          <RepairProgress />
        </Grid>
      </Grid>
    </>
  );
};

export default OperationsCenter;