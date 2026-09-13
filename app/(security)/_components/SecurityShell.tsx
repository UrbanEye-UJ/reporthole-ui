"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Box, Button, Typography } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

import { securityNavigation } from "./nav";

/**
 * Chrome for the security-admin surface: a fixed sidebar of the three
 * capability screens plus a top bar with a sign-out control.
 *
 * Intentionally simpler than the operational `AdminShell` (no collapse, no
 * theme toggle) — this surface is used rarely and by few people.
 */
export default function SecurityShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "reporthole_token=; path=/; max-age=0";
    document.cookie = "reporthole_role=; path=/; max-age=0";
    document.cookie = "reporthole_user_id=; path=/; max-age=0";
    router.push("/login");
  };

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
          <ShieldRoundedIcon fontSize="small" color="primary" />
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
                  borderRadius: 1.5,
                  textDecoration: "none",
                  color: active ? "primary.main" : "text.secondary",
                  bgcolor: active ? "action.selected" : "transparent",
                  fontWeight: active ? 700 : 500,
                  "&:hover": { bgcolor: "action.hover" },
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
