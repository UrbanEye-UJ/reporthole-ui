import { createTheme } from "@mui/material/styles";

import { colors } from "./colors";
import { typography } from "./typography";
import { radius } from "./radius";
import { shadows } from "./shadows";

import type { AdminThemeMode } from "./AdminThemeContext";

/** Creates the MUI theme for the admin panel. Call with the current mode. */
export function createAdminTheme(mode: AdminThemeMode) {
  const palette = mode === "dark" ? colors.dark : colors.light;
  const isDark = mode === "dark";

  // Lighter shadows for the light theme so cards don't look heavy on a white background
  const cardShadow = isDark
    ? shadows.card
    : "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)";

  const glassShadow = isDark
    ? shadows.glass
    : "0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)";

  const hoverShadow = isDark
    ? shadows.hover
    : "0 4px 12px rgba(37,99,235,0.15)";

  return createTheme({
    palette: {
      mode,

      primary: {
        main: palette.primary,
      },

      secondary: {
        main: palette.secondary,
      },

      success: {
        main: palette.success,
      },

      warning: {
        main: palette.warning,
      },

      error: {
        main: palette.danger,
      },

      info: {
        main: palette.info,
      },

      background: {
        default: palette.background.primary,
        paper: palette.background.secondary,
      },

      text: {
        primary: palette.text.primary,
        secondary: palette.text.secondary,
        disabled: palette.text.disabled,
      },

      divider: palette.border,
    },

    shape: {
      // Use MUI's default unit (4) so numeric sx values scale sensibly:
      // borderRadius: 3 in sx = 12px (rounded-xl), borderRadius: 4 = 16px (rounded-2xl)
      borderRadius: 4,
    },

    typography,

    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: "16px", // rounded-2xl — matches civilian card radius
            background: palette.surface.primary,
            backdropFilter: isDark ? "blur(18px)" : "none",
            WebkitBackdropFilter: isDark ? "blur(18px)" : "none",
            border: `1px solid ${palette.border}`,
            backgroundImage: "none",
            boxShadow: glassShadow,
            transition: "all .25s ease",

            "&:hover": {
              background: palette.surface.secondary,
              boxShadow: hoverShadow,
              borderColor: palette.primary,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "16px",
            background: palette.surface.primary,
            backdropFilter: isDark ? "blur(18px)" : "none",
            WebkitBackdropFilter: isDark ? "blur(18px)" : "none",
            backgroundImage: "none",
            border: `1px solid ${palette.border}`,
            boxShadow: cardShadow,
            transition: "all .25s ease",

            "&:hover": {
              background: palette.surface.secondary,
              boxShadow: hoverShadow,
              transform: "translateY(-2px)",
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            textTransform: "none",
            fontWeight: 600,
            transition: ".25s",

            "&:hover": {
              boxShadow: shadows.glowBlue,
            },
          },

          contained: {
            background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,

            "&:hover": {
              filter: "brightness(1.05)",
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.round,
            transition: ".25s",

            "&:hover": {
              background: palette.glass.hover,
              backdropFilter: "blur(12px)",
            },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            transition: ".25s",

            "&:hover": {
              background: palette.glass.hover,
            },

            "&.Mui-selected": {
              background: palette.glass.active,
              boxShadow: shadows.glowBlue,

              "&:hover": {
                background: palette.glass.active,
              },
            },
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            background: palette.surface.primary,

            "& fieldset": {
              borderColor: palette.border,
            },

            "&:hover fieldset": {
              borderColor: palette.primary,
            },

            "&.Mui-focused fieldset": {
              borderColor: palette.primary,
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: radius.round,
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: palette.border,
          },
        },
      },
    },
  });
}

export default createAdminTheme("dark");
