import {
  Box,
  Pagination,
  Typography,
} from "@mui/material";

interface TablePaginationProps {
  page: number;
  count: number;
  total: number;
  onChange: (page: number) => void;
}

const TablePagination = ({
  page,
  count,
  total,
  onChange,
}: TablePaginationProps) => {
  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {total} record{total === 1 ? "" : "s"}
      </Typography>

      <Pagination
        page={page}
        count={count}
        color="primary"
        shape="rounded"
        onChange={(_, value) => onChange(value)}
      />
    </Box>
  );
};

export default TablePagination;