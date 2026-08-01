import type { GridColDef } from "@mui/x-data-grid";

import DataTable from "../../../components/tables/DataTable";
import Panel from "../../../components/ui/Panel";
import StatusBadge from "../../../components/ui/StatusBadge";

const rows = [
  {
    id: 1,
    road: "N1 North",
    district: "Johannesburg",
    severity: "Critical",
    status: "Open",
  },
  {
    id: 2,
    road: "R21",
    district: "Pretoria",
    severity: "High",
    status: "Assigned",
  },
  {
    id: 3,
    road: "M2",
    district: "Johannesburg",
    severity: "Medium",
    status: "In Progress",
  },
  {
    id: 4,
    road: "N3",
    district: "Ekurhuleni",
    severity: "Low",
    status: "Resolved",
  },
];

const columns: GridColDef[] = [
  {
    field: "road",
    headerName: "Road",
    flex: 1,
  },
  {
    field: "district",
    headerName: "District",
    flex: 1,
  },
  {
    field: "severity",
    headerName: "Severity",
    width: 120,
  },
  {
    field: "status",
    headerName: "Status",
    width: 160,
    renderCell: (params) => (
      <StatusBadge status={params.value} />
    ),
  },
];

const RecentIncidents = () => {
  return (
    <Panel title="Recent Incidents">
      <DataTable
        rows={rows}
        columns={columns}
        height={380}
      />
    </Panel>
  );
};

export default RecentIncidents;