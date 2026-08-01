"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Avatar,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";

import { useAdminTheme } from "../styles/AdminThemeContext";

// TODO(api): replace hardcoded "A" avatar and title with data from GET /auth/me
// Expected shape: { firstName: string; lastName: string; role: string }
const AdminTopbar = () => {
  const { mode, toggle } = useAdminTheme();

  const isDark = mode === "dark";

  return (
    <AppBar
      position="sticky"
      elevation={0}
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
        {/* Left Section */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Road Infrastructure Operations Platform
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 0.5,
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Gauteng Province
            </Typography>

            <Chip
              size="small"
              label="● AI Online"
              color="success"
              sx={{
                fontWeight: 600,
                borderRadius: 10,
              }}
            />
          </Box>
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search incidents..."
            slotProps={{
              input: {
                startAdornment: (
                  <SearchRoundedIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              },
            }}
            sx={{
              width: 320,

              "& .MuiOutlinedInput-root": {
                borderRadius: "999px",

                background: isDark
                  ? "rgba(255,255,255,.05)"
                  : "rgba(0,0,0,.04)",

                backdropFilter: "blur(12px)",

                transition: ".25s",

                "& fieldset": {
                  borderColor: isDark
                    ? "rgba(255,255,255,.08)"
                    : "rgba(0,0,0,.12)",
                },

                "&:hover fieldset": {
                  borderColor: "primary.main",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />

          {/* Theme toggle */}
          <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              onClick={toggle}
              aria-label="Toggle theme"
              sx={{
                bgcolor: isDark
                  ? "rgba(255,255,255,.05)"
                  : "rgba(0,0,0,.05)",

                "&:hover": {
                  bgcolor: isDark
                    ? "rgba(59,130,246,.18)"
                    : "rgba(37,99,235,.10)",
                  transform: "scale(1.05)",
                },

                transition: ".25s",
              }}
            >
              {isDark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <IconButton
            sx={{
              bgcolor: isDark
                ? "rgba(255,255,255,.05)"
                : "rgba(0,0,0,.05)",

              "&:hover": {
                bgcolor: isDark
                  ? "rgba(59,130,246,.18)"
                  : "rgba(37,99,235,.10)",
                transform: "scale(1.05)",
              },

              transition: ".25s",
            }}
          >
            <NotificationsRoundedIcon />
          </IconButton>

          {/* User avatar — TODO(api): replace "A" with first letter of GET /auth/me firstName */}
          <Avatar
            sx={{
              bgcolor: "primary.main",
              fontWeight: 700,
              boxShadow:
                "0 0 20px rgba(59,130,246,.35)",
            }}
          >
            A
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminTopbar;
