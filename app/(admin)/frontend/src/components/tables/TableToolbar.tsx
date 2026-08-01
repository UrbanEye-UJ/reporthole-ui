import type { ReactNode } from "react";

import {
  Box,
  Typography,
} from "@mui/material";

interface TableToolbarProps {
  title: string;
  total?: number;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

const TableToolbar = ({
  title,
  total,
  leftContent,
  rightContent,
}: TableToolbarProps) => {
  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        {total !== undefined && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {total} record{total === 1 ? "" : "s"}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {leftContent}

        {rightContent}
      </Box>
    </Box>
  );
};

export default TableToolbar;