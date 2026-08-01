import {
  DataGrid,
  type GridColDef,
  type GridRowsProp,
} from "@mui/x-data-grid";

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  height?: number;
}

const DataTable = ({
  rows,
  columns,
  loading = false,
  height = 600,
}: DataTableProps) => {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      disableRowSelectionOnClick
      pageSizeOptions={[10, 25, 50, 100]}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 10,
            page: 0,
          },
        },
      }}
      sx={{
        border: "none",

        "& .MuiDataGrid-columnHeaders": {
          background: "rgba(255,255,255,.05)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          fontWeight: 700,
        },

        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid rgba(255,255,255,.05)",
        },

        "& .MuiDataGrid-row:hover": {
          background: "rgba(59,130,246,.08)",
        },

        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid rgba(255,255,255,.08)",
        },

        "& .MuiDataGrid-columnSeparator": {
          display: "none",
        },
      }}
      style={{
        height,
        width: "100%",
      }}
    />
  );
};

export default DataTable;