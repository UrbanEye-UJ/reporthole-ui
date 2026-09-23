"use client";

import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

const MOBILE_SIDEBAR_WIDTH = 260;

interface Props {
  children: ReactNode;
}

const AdminShell = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
          gridTemplateColumns: isMobile ? "1fr" : collapsed ? "80px 1fr" : "260px 1fr",
          gridTemplateRows: "70px 1fr",
          minHeight: "100vh",
          transition: "all .3s ease",
        }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": { width: MOBILE_SIDEBAR_WIDTH, boxSizing: "border-box" } }}
          >
            <AdminSidebar
              collapsed={false}
              setCollapsed={setCollapsed}
              onClose={() => setMobileOpen(false)}
              onNavigate={() => setMobileOpen(false)}
            />
          </Drawer>
        ) : (
          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        )}

        <AdminTopbar isMobile={isMobile} onMenuClick={() => setMobileOpen(true)} />

        <Box
          component="main"
          sx={{
            gridColumn: isMobile ? 1 : 2,
            gridRow: 2,
            p: { xs: 2, md: 3 },
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
