"use client";

import type { Dispatch, SetStateAction } from "react";

import {
  Box,
  IconButton,
  Typography,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigation } from "../navigation";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

const AdminSidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        gridRow: "1 / span 2",
        width: collapsed ? 80 : 260,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        transition: "width 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed
            ? "center"
            : "space-between",
          px: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            Reporthole
          </Typography>
        )}

        <IconButton
          color="inherit"
          onClick={() =>
            setCollapsed((previous) => !previous)
          }
        >
          <MenuRoundedIcon />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <Box
        sx={{
          mt: 2,
          px: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              style={{ textDecoration: "none" }}
            >
              <Box
                sx={{
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  px: collapsed ? 0 : 2,
                  justifyContent: collapsed
                    ? "center"
                    : "flex-start",

                  borderRadius: 3,

                  bgcolor: isActive
                    ? "primary.main"
                    : "transparent",

                  backdropFilter: isActive
                    ? "blur(14px)"
                    : undefined,

                  boxShadow: isActive
                    ? "0 0 20px rgba(59,130,246,.25)"
                    : "none",

                  color: isActive
                    ? "#ffffff"
                    : "text.secondary",

                  transition: "all 0.25s ease",

                  "&:hover": {
                    bgcolor: isActive
                      ? "primary.dark"
                      : "rgba(255,255,255,.06)",

                    transform: "translateX(4px)",

                    boxShadow:
                      "0 6px 18px rgba(0,0,0,.18)",
                  },
                }}
              >
                <Icon />

                {!collapsed && (
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: isActive
                        ? 600
                        : 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </Typography>
                )}
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
};

export default AdminSidebar;
