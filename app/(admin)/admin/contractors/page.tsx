"use client";

import { useMemo, useState } from "react";

import { Button, Grid } from "@mui/material";

import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";

import DataTable from "../../_components/tables/DataTable";
import AddContractorModal from "../../_components/contractors/AddContractorModal";

import { useGetContractors } from "@/lib/hooks/useContractors";

import type { GridColDef } from "@mui/x-data-grid";

// TODO(api): "Completed Repairs" and "Average SLA" need a dedicated backend aggregation
// endpoint (counting RESOLVED assignments platform-wide) — left as placeholders for now.

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Contractor",
    flex: 1,
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1,
  },
  {
    field: "phoneNumber",
    headerName: "Phone",
    width: 160,
  },
  {
    field: "activeJobs",
    headerName: "Active Jobs",
    width: 140,
  },
];

export default function ContractorsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useGetContractors();

  const contractors = useMemo(() => data?.data ?? [], [data]);
  const rows = useMemo(
    () =>
      contractors.map((contractor) => ({
        id: contractor.userId,
        name: `${contractor.firstName} ${contractor.lastName}`,
        email: contractor.email,
        phoneNumber: contractor.phoneNumber,
        activeJobs: contractor.activeJobs,
      })),
    [contractors]
  );

  const activeContracts = contractors.reduce((sum, c) => sum + c.activeJobs, 0);

  return (
    <>
      <PageHeader
        title="Contractors"
        subtitle="Manage contractors responsible for road maintenance."
        actions={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setModalOpen(true)}
          >
            Add Contractor
          </Button>
        }
      />

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Registered Contractors"
            value={contractors.length}
            icon={<EngineeringRoundedIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Active Contracts"
            value={activeContracts}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Completed Repairs"
            value="—"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Average SLA"
            value="—"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Contractor Overview">
            <DataTable
              rows={rows}
              columns={columns}
              loading={isLoading}
              height={520}
            />
          </Panel>
        </Grid>
      </Grid>

      <AddContractorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
