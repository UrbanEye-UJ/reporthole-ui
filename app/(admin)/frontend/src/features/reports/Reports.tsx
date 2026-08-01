import { Button, Grid } from "@mui/material";

import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

import type { GridColDef } from "@mui/x-data-grid";

import PageHeader from "../../components/ui/PageHeader";
import MetricCard from "../../components/ui/MetricCard";
import Panel from "../../components/ui/Panel";
import DataTable from "../../components/tables/DataTable";

const rows = [
  {
    id: 1,
    report: "Monthly Incident Report",
    generated: "01 Aug 2026",
    format: "PDF",
  },
  {
    id: 2,
    report: "Contractor Performance",
    generated: "31 Jul 2026",
    format: "Excel",
  },
  {
    id: 3,
    report: "Infrastructure Summary",
    generated: "30 Jul 2026",
    format: "CSV",
  },
];

const columns: GridColDef[] = [
  {
    field: "report",
    headerName: "Report",
    flex: 1,
  },
  {
    field: "generated",
    headerName: "Generated",
    width: 170,
  },
  {
    field: "format",
    headerName: "Format",
    width: 120,
  },
];

const Reports = () => {
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate operational and analytical reports."
        actions={
          <Button
            variant="contained"
            startIcon={<FileDownloadRoundedIcon />}
          >
            Generate Report
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Reports Generated"
            value="128"
            icon={<AssessmentRoundedIcon />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Scheduled Reports"
            value="18"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="PDF Exports"
            value="84"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <MetricCard
            title="Excel Exports"
            value="44"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Panel title="Recent Reports">
            <DataTable
              rows={rows}
              columns={columns}
              height={500}
            />
          </Panel>
        </Grid>
      </Grid>
    </>
  );
};

export default Reports;