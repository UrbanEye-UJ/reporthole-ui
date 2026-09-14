"use client";

import { DataGrid, type GridColDef, type GridPaginationModel, type GridRowsProp } from "@mui/x-data-grid";

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  height?: number;
  /**
   * "server" hands pagination control to the caller (via `paginationModel` +
   * `onPaginationModelChange` + `rowCount`) — for a table backed by a paginated API rather
   * than a full in-memory row set. Defaults to "client" (paginate whatever `rows` holds).
   */
  paginationMode?: "client" | "server";
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  rowCount?: number;
}

/**
 * Thin wrapper over MUI `DataGrid` for the security-admin screens.
 *
 * Isolated in its own module so tests can `jest.mock` it — `@mui/x-data-grid`
 * ships ESM-only internals that don't load under jsdom (same reason the
 * `(admin)` group has its own wrapper).
 */
export default function DataTable({
  rows,
  columns,
  loading = false,
  height = 560,
  paginationMode = "client",
  paginationModel,
  onPaginationModelChange,
  rowCount,
}: DataTableProps) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      disableRowSelectionOnClick
      paginationMode={paginationMode}
      {...(paginationMode === "server"
        ? { paginationModel, onPaginationModelChange, rowCount, pageSizeOptions: [50] }
        : {
            pageSizeOptions: [10, 25, 50, 100],
            initialState: { pagination: { paginationModel: { pageSize: 25, page: 0 } } },
          })}
      sx={{
        border: "none",
        "& .MuiDataGrid-columnHeaders": { fontWeight: 700 },
      }}
      style={{ height, width: "100%" }}
    />
  );
}
