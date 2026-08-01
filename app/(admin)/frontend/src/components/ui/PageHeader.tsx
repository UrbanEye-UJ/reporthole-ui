import type { ReactNode } from "react";

import {
  Box,
  Typography,
} from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader = ({
  title,
  subtitle,
  actions,
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: 2,
        mb: 4,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && <Box>{actions}</Box>}
    </Box>
  );
};

export default PageHeader;