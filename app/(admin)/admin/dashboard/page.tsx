"use client";

import { Grid } from "@mui/material";

import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import MetricCard from "../../_components/ui/MetricCard";
import PageHeader from "../../_components/ui/PageHeader";

import IncidentMap from "../../_components/dashboard/IncidentMap";
import RecentIncidents from "../../_components/dashboard/RecentIncidents";
import RepairProgress from "../../_components/dashboard/RepairProgress";

import { useGetIncidentStats } from "@/lib/hooks/useIncidentStats";
import { useGetContractors } from "@/lib/hooks/useContractors";

export default function DashboardPage() {
  const { data: statsData } = useGetIncidentStats();
  const { data: contractorsData } = useGetContractors();

  const stats = statsData?.data;
  const contractors = contractorsData?.data ?? [];

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

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <MetricCard
            title="Total Incidents"
            value={stats?.totalIncidents ?? 0}
            icon={<ReportRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <MetricCard
            title="Active Contractors"
            value={contractors.length}
            color="#22C55E"
            icon={<EngineeringRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <MetricCard
            title="Repairs Completed"
            value={stats?.resolvedIncidents ?? 0}
            color="#38BDF8"
            icon={<CheckCircleRoundedIcon />}
          />
        </Grid>

        {/* Map */}

        <Grid size={{ xs: 12 }}>
          <IncidentMap />
        </Grid>

        {/* Recent */}

        <Grid size={{ xs: 12 }}>
          <RecentIncidents />
        </Grid>

        {/* Progress */}

        <Grid size={12}>
          <RepairProgress />
        </Grid>
      </Grid>
    </>
  );
}
