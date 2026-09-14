import { createTheme } from "@mui/material/styles";

import { colors } from "./colors";
import { typography } from "./typography";
import { radius } from "./radius";

import type { AdminThemeMode } from "./AdminThemeContext";

/** Creates the MUI theme for the admin panel. Call with the current mode. */
export function createAdminTheme(mode: AdminThemeMode) {
  const palette = mode === "dark" ? colors.dark : colors.light;
  const isDark = mode === "dark";

  const cardShadow = isDark
    ? "0 1px 3px rgba(0,0,0,0.4)"
    : "0 1px 3px rgba(0,0,0,0.06)";

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
      borderRadius: 4,
    },

    typography,

    components: {
      // AppBar is built on top of Paper internally, so it inherits MuiPaper's
      // borderRadius below unless overridden here — nav chrome should be square.
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            background: palette.surface.primary,
            border: `1px solid ${palette.border}`,
            backgroundImage: "none",
            boxShadow: cardShadow,

            "&:hover": {
              background: palette.surface.secondary,
            },
          },
        },
      },

      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            background: palette.surface.primary,
            backgroundImage: "none",
            border: `1px solid ${palette.border}`,
            boxShadow: cardShadow,

            "&:hover": {
              background: palette.surface.secondary,
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
            transition: ".2s",
            boxShadow: "none",

            "&:hover": {
              boxShadow: "none",
            },
          },

          contained: {
            background: palette.primary,
            color: isDark ? "#111111" : "#FFFFFF",

            "&:hover": {
              background: isDark ? "#E5E7EB" : "#374151",
            },
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            // Notion's chrome buttons are subtly-rounded squares, not circles.
            borderRadius: radius.sm,
            transition: ".2s",

            "&:hover": {
              background: palette.glass.hover,
            },
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            transition: ".2s",

            "&:hover": {
              background: palette.glass.hover,
            },

            // Notion's selected list item is a soft gray highlight with the
            // same text color as the rest — not a black/white inversion.
            "&.Mui-selected": {
              background: palette.background.tertiary,
              color: palette.text.primary,

              "&:hover": {
                background: palette.background.tertiary,
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
              borderColor: palette.text.secondary,
            },

            "&.Mui-focused fieldset": {
              borderColor: palette.text.primary,
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
