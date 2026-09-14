"use client";

import { Box } from "@mui/material";
import { useState } from "react";
import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

interface Props {
  children: ReactNode;
}

const AdminShell = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    /*
     * Dark body styles live on this wrapper instead of on <body> via CssBaseline.
     * This keeps the dark background contained within the admin DOM subtree and
     * prevents it from leaking into the civilian UI on SPA navigation.
     * Colors come from the theme (not hardcoded) so this stays in sync with
     * `_components/styles/colors.ts` instead of drifting from it.
     */
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundAttachment: "fixed",
        color: "text.primary",
        fontFamily:
          '"Inter", "Roboto", "Segoe UI", Helvetica, Arial, sans-serif',
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: collapsed ? "80px 1fr" : "260px 1fr",
          gridTemplateRows: "70px 1fr",
          minHeight: "100vh",
          transition: "all .3s ease",
        }}
      >
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <AdminTopbar />

        <Box
          component="main"
          sx={{
            gridColumn: 2,
            gridRow: 2,
            p: 3,
            overflow: "auto",
            background: "transparent",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminShell;
