"use client";

import { useState } from "react";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";

import { useRouter } from "next/navigation";

import { useAdminTheme } from "../styles/AdminThemeContext";
import { useGetRecentIncidents } from "@/lib/hooks/useRecentIncidents";
import { formatIncidentType, STATUS_MAP } from "../tables/incidentColumns";
import type { AssignmentStatus } from "@/lib/hooks/useRecentIncidents";

const AdminTopbar = () => {
  const { mode, toggle } = useAdminTheme();
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: recentData } = useGetRecentIncidents(10);
  const recentIncidents = recentData?.data ?? [];

  /** Incidents that have not been verified or assigned yet count as "unactioned" */
  const unactionedCount = recentIncidents.filter(
    (i) => i.status === "REPORTED" || i.status === "VERIFIED"
  ).length;

  const handleLogout = () => {
    document.cookie = "reporthole_token=; path=/; max-age=0";
    document.cookie = "reporthole_role=; path=/; max-age=0";
    document.cookie = "reporthole_user_id=; path=/; max-age=0";
    router.push("/");
  };

  const isDark = mode === "dark";

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          gridColumn: 2,
          background: isDark
            ? "rgba(17, 25, 40, 0.72)"
            : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.08)",
          boxShadow: "none",
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        <Toolbar
          sx={{
            height: 70,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Left */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Road Infrastructure Operations Platform
            </Typography>
          </Box>

          {/* Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search incidents..."
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchRoundedIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                },
              }}
              sx={{
                width: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  background: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)",
                  backdropFilter: "blur(12px)",
                  transition: ".25s",
                  "& fieldset": { borderColor: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.12)" },
                  "&:hover fieldset": { borderColor: "primary.main" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
            />

            {/* Theme toggle */}
            <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton
                onClick={toggle}
                aria-label="Toggle theme"
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(59,130,246,.18)" : "rgba(37,99,235,.10)",
                    transform: "scale(1.05)",
                  },
                  transition: ".25s",
                }}
              >
                {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={() => setNotifOpen(true)}
                aria-label="Open notifications"
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(59,130,246,.18)" : "rgba(37,99,235,.10)",
                    transform: "scale(1.05)",
                  },
                  transition: ".25s",
                }}
              >
                <Badge badgeContent={unactionedCount > 0 ? unactionedCount : 0} color="error" max={99}>
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User avatar — TODO(api): replace "A" with first letter of profile first name */}
            <Avatar sx={{ bgcolor: "primary.main", fontWeight: 700, boxShadow: "0 0 20px rgba(59,130,246,.35)" }}>
              A
            </Avatar>

            {/* Logout */}
            <Tooltip title="Log out">
              <IconButton
                onClick={handleLogout}
                aria-label="Log out"
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)",
                  "&:hover": {
                    bgcolor: "rgba(239,68,68,.12)",
                    color: "error.main",
                    transform: "scale(1.05)",
                  },
                  transition: ".25s",
                }}
              >
                <LogoutRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Notification drawer */}
      <Drawer
        anchor="right"
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        slotProps={{ paper: { sx: { width: 380, p: 3 } } }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Recent incident activity
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {recentIncidents.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
            No recent incidents.
          </Typography>
        ) : (
          <Stack spacing={0}>
            {recentIncidents.map((incident, idx) => {
              const statusLabel = STATUS_MAP[incident.status as AssignmentStatus] ?? "Open";
              const isUnactioned = incident.status === "REPORTED" || incident.status === "VERIFIED";
              return (
                <Box key={incident.incidentId ?? idx}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      py: 1.5,
                      px: 1,
                      borderRadius: 2,
                      bgcolor: isUnactioned
                        ? isDark ? "rgba(59,130,246,.08)" : "rgba(37,99,235,.05)"
                        : "transparent",
                    }}
                  >
                    <Box
                      sx={{
                        mt: 0.25,
                        color: isUnactioned ? "primary.main" : "text.disabled",
                        flexShrink: 0,
                      }}
                    >
                      <ReportProblemRoundedIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: isUnactioned ? 600 : 400 }} noWrap>
                        {formatIncidentType(incident.incidentType)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {incident.locationAddress || "Unknown location"}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
                        <Chip
                          label={statusLabel}
                          size="small"
                          color={isUnactioned ? "warning" : "default"}
                          variant={isUnactioned ? "filled" : "outlined"}
                          sx={{ height: 18, fontSize: "0.65rem" }}
                        />
                        {incident.incidentDate && (
                          <Typography variant="caption" color="text.disabled">
                            {new Date(incident.incidentDate).toLocaleDateString("en-ZA", {
                              day: "numeric",
                              month: "short",
                            })}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                  {idx < recentIncidents.length - 1 && <Divider />}
                </Box>
              );
            })}
          </Stack>
        )}
      </Drawer>
    </>
  );
};

export default AdminTopbar;
