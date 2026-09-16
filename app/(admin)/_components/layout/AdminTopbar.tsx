"use client";

import { useState } from "react";

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

import { useAdminTheme } from "../styles/AdminThemeContext";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/useNotifications";
import { useLogout } from "@/lib/hooks/useLogout";
import { useGetProfile } from "@/app/api/generated/user-profile/user-profile";

const AdminTopbar = () => {
  const { mode, toggle } = useAdminTheme();
  const handleLogout = useLogout();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { data: profileData } = useGetProfile({ query: { staleTime: 1000 * 60 * 5 } });
  const avatarInitial = profileData?.data?.firstName?.[0]?.toUpperCase() ?? "?";

  const handleOpenNotif = () => {
    setNotifOpen(true);
    if (unreadCount > 0) markAllRead();
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
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          transition: "background 0.3s ease",
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
            {/* Theme toggle */}
            <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton
                onClick={toggle}
                aria-label="Toggle theme"
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.08)",
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
                onClick={handleOpenNotif}
                aria-label="Open notifications"
                sx={{
                  bgcolor: isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.05)",
                  "&:hover": {
                    bgcolor: isDark ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.08)",
                  },
                  transition: ".25s",
                }}
              >
                <Badge badgeContent={unreadCount > 0 ? unreadCount : 0} color="error" max={99}>
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User avatar */}
            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>
              {avatarInitial}
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
          Your incident activity
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 6, gap: 1 }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {notifications.map((n, idx) => (
              <Box key={n.id}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    py: 1.5,
                    px: 1,
                    borderRadius: 2,
                    bgcolor: !n.read
                      ? isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"
                      : "transparent",
                  }}
                >
                  <Box
                    sx={{
                      mt: 0.4,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: !n.read ? "primary.main" : "transparent",
                      border: n.read ? "1.5px solid" : "none",
                      borderColor: "divider",
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: !n.read ? 600 : 400, lineHeight: 1.4 }}
                    >
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : ""}
                    </Typography>
                  </Box>
                </Box>
                {idx < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </Stack>
        )}
      </Drawer>
    </>
  );
};

export default AdminTopbar;
