"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import { securityNavigation } from "./nav";
import { useLogout } from "@/lib/hooks/useLogout";

/**
 * Chrome for the security-admin surface: a fixed sidebar of capability
 * screens plus a top bar with a theme toggle and sign-out control.
 *
 * Intentionally simpler than the operational `AdminShell` (no collapse) —
 * this surface is used rarely and by few people.
 */
interface Props {
  children: ReactNode;
  mode: "dark" | "light";
  toggleMode: () => void;
}

export default function SecurityShell({ children, mode, toggleMode }: Props) {
  const pathname = usePathname();
  const handleLogout = useLogout();
  const isDark = mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gridTemplateRows: "64px 1fr",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          gridRow: "1 / span 2",
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <ShieldRoundedIcon fontSize="small" sx={{ color: "text.primary" }} />
          <Typography sx={{ fontWeight: 700 }}>Security Admin</Typography>
        </Box>

        <Box component="nav" sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
          {securityNavigation.map((item) => {
            const active = pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Box
                key={item.id}
                component={Link}
                href={item.path}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.15,
                  borderRadius: "6px",
                  textDecoration: "none",
                  // Notion's selected sidebar item is a soft gray highlight with
                  // the same text color as the rest — not a black/white inversion.
                  color: active ? "text.primary" : "text.secondary",
                  bgcolor: active ? (isDark ? "#2A2A2A" : "#EDECEA") : "transparent",
                  fontWeight: active ? 600 : 500,
                  "&:hover": { bgcolor: active ? (isDark ? "#2A2A2A" : "#EDECEA") : (isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)") },
                  transition: "background-color .15s ease",
                }}
              >
                <Icon fontSize="small" />
                <span>{item.label}</span>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          gridColumn: 2,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          <IconButton onClick={toggleMode} aria-label="Toggle theme" size="small" sx={{ mr: 1 }}>
            {isDark ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Button
          size="small"
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </Box>

      <Box component="main" sx={{ gridColumn: 2, gridRow: 2, p: 3, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
