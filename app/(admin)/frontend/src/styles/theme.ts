import { createTheme } from "@mui/material/styles";

import { colors } from "./colors";
import { typography } from "./typography";
import { radius } from "./radius";
import { shadows } from "./shadows";

// Change this to colors.light later if you add a theme switch
const palette = colors.dark;

const theme = createTheme({
  palette: {
    mode: "dark",

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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top left, #163A72 0%, #08111F 45%, #050B14 100%)",
          backgroundAttachment: "fixed",
          color: palette.text.primary,
          fontFamily: typography.fontFamily,
        },

        "*": {
          boxSizing: "border-box",
        },

        "*::-webkit-scrollbar": {
          width: 10,
          height: 10,
        },

        "*::-webkit-scrollbar-thumb": {
          background: "rgba(59,130,246,.35)",
          borderRadius: 20,
        },

        "*::-webkit-scrollbar-track": {
          background: "transparent",
        },
      },
    },

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

export default theme;