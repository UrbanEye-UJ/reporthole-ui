import { createTheme } from "@mui/material/styles";

import { colors } from "./colors";
import { typography } from "./typography";
import { radius } from "./radius";
import { shadows } from "./shadows";

import type { AdminThemeMode } from "./AdminThemeContext";

/** Creates the MUI theme for the admin panel. Call with the current mode. */
export function createAdminTheme(mode: AdminThemeMode) {
  const palette = mode === "dark" ? colors.dark : colors.light;

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
      borderRadius: radius.lg,
    },

    typography,

    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: palette.surface.primary,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: `1px solid ${palette.border}`,
            backgroundImage: "none",
            boxShadow: shadows.glass,
            transition: "all .25s ease",

            "&:hover": {
              background: palette.surface.secondary,
              boxShadow: shadows.hover,
              borderColor: palette.primary,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            background: palette.surface.primary,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            backgroundImage: "none",
            border: `1px solid ${palette.border}`,
            boxShadow: shadows.card,
            transition: "all .25s ease",

            "&:hover": {
              background: palette.surface.secondary,
              boxShadow: shadows.hover,
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
