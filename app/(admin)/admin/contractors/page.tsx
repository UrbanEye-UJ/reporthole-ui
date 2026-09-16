"use client";

import { useMemo, useState } from "react";

import { Button, Chip, Grid, Stack, Tooltip } from "@mui/material";

import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import PageHeader from "../../_components/ui/PageHeader";
import MetricCard from "../../_components/ui/MetricCard";
import Panel from "../../_components/ui/Panel";

import DataTable from "../../_components/tables/DataTable";
import AddContractorModal from "../../_components/contractors/AddContractorModal";
import RevealEmailDialog from "../../_components/contractors/RevealEmailDialog";
import { formatSpecialisation } from "../../_components/tables/incidentColumns";

import { useGetContractors } from "@/app/api/generated/admin-contractors/admin-contractors";

import type { GridColDef } from "@mui/x-data-grid";

export default function ContractorsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [revealTarget, setRevealTarget] = useState<{ id: string; name: string } | null>(null);
  const { data, isLoading } = useGetContractors();

  const contractors = useMemo(() => data?.data ?? [], [data]);
  const rows = useMemo(
    () =>
      contractors.map((contractor) => ({
        id: contractor.userId,
        name: `${contractor.firstName} ${contractor.lastName}`,
        email: contractor.email,
        phoneNumber: contractor.phoneNumber,
        activeJobs: contractor.activeJobs ?? 0,
        specialisations: contractor.specialisations ?? [],
      })),
    [contractors]
  );

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
    {
      field: "specialisations",
      headerName: "Specialisations",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const specs = params.row.specialisations as string[];
        const [first, ...rest] = specs;
        if (!first) return null;
        return (
            <Stack direction="row" spacing={0.5} sx={{ py: 1, alignItems: "center" }}>
            <Chip label={formatSpecialisation(first)} size="small" />
            {rest.length > 0 && (
              <Tooltip
                placement="top"
                title={
                  <Stack spacing={0.5}>
                    {rest.map((s) => (
                      <span key={s}>{formatSpecialisation(s)}</span>
                    ))}
                  </Stack>
                }
              >
                <Chip label={`+${rest.length}`} size="small" variant="outlined" sx={{ cursor: "default" }} />
              </Tooltip>
            )}
          </Stack>
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          startIcon={<VisibilityRoundedIcon />}
          onClick={() => setRevealTarget({ id: params.row.id, name: params.row.name })}
        >
          View
        </Button>
      ),
    },
  ];

  const activeContracts = contractors.reduce((sum, c) => sum + (c.activeJobs ?? 0), 0);
  const completedRepairs = contractors.reduce((sum, c) => sum + (c.completedJobs ?? 0), 0);

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
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Registered Contractors"
            value={contractors.length}
            icon={<EngineeringRoundedIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Active Contracts"
            value={activeContracts}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard
            title="Completed Repairs"
            value={completedRepairs}
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

      <RevealEmailDialog
        open={!!revealTarget}
        onClose={() => setRevealTarget(null)}
        contractorId={revealTarget?.id ?? null}
        contractorName={revealTarget?.name ?? ""}
      />
    </>
  );
}
