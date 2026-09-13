"use client";

import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

/**
 * Lightweight page-level building blocks for the security-admin surface.
 *
 * Kept deliberately self-contained (rather than importing the richer `(admin)`
 * primitives) so this route group has no coupling to the operational admin UI,
 * which is under active change on its own branch.
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Title + optional subtitle and right-aligned actions, shown at the top of each page. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>}
    </Box>
  );
}

interface PanelProps {
  title?: string;
  children: ReactNode;
}

/** A titled surface for a section of a page. */
export function Panel({ title, children }: PanelProps) {
  return (
    <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", overflow: "auto" }}>
      {title && (
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
}
