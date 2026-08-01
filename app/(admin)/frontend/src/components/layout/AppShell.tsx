import { Box } from "@mui/material";
import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface Props {
  children: ReactNode;
}

const AppShell = ({ children }: Props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: collapsed ? "80px 1fr" : "260px 1fr",
        gridTemplateRows: "70px 1fr",
        minHeight: "100vh",
        transition: "all .3s ease",
      }}
    >
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <Topbar />

      <Box
        component="main"
        sx={{
          gridColumn: 2,
          gridRow: 2,
          p: 3,
overflow: "auto",
background:
  "linear-gradient(180deg, transparent, rgba(255,255,255,.02))",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppShell;