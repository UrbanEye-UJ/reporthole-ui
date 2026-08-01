"use client";

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
          background: (t) =>
            t.palette.mode === "dark"
              ? "rgba(255,255,255,.05)"
              : "rgba(0,0,0,.03)",
          borderBottom: (t) =>
            `1px solid ${t.palette.divider}`,
          fontWeight: 700,
        },

        "& .MuiDataGrid-cell": {
          borderBottom: (t) =>
            `1px solid ${t.palette.divider}`,
        },

        "& .MuiDataGrid-row:hover": {
          background: "rgba(37,99,235,.06)",
        },

        "& .MuiDataGrid-footerContainer": {
          borderTop: (t) =>
            `1px solid ${t.palette.divider}`,
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
