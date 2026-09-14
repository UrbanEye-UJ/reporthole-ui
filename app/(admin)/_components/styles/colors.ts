/**
 * Notion-style palette. `background.secondary` is the sidebar/chrome tone (a
 * tinted gray-white in light mode, a tone darker than canvas in dark mode);
 * `background.primary` is the main canvas. Status colors (success/warning/
 * danger/info) are intentionally kept saturated and distinct from
 * primary/secondary — those stay near-black/near-white for buttons and
 * selected nav, so a status chip is never confused with a UI action.
 */
export const colors = {
  dark: {
    background: {
      primary: "#191919",
      secondary: "#202020",
      tertiary: "#2A2A2A",
    },

    surface: {
      primary: "#202020",
      secondary: "#2A2A2A",
    },

    border: "#2F2F2F",

    glass: {
      background: "rgba(255,255,255,0.03)",
      hover: "rgba(255,255,255,.06)",
      active: "#FFFFFF",
    },

    text: {
      primary: "#E9E9E7",
      secondary: "#9B9A97",
      disabled: "#6F6E69",
    },

    primary: "#FFFFFF",
    secondary: "#9B9A97",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#38BDF8",
  },

  light: {
    // background.secondary (sidebar/chrome) is a tinted gray-white distinct from
    // background.primary (the white main canvas) — the Notion "sidebar vs. page" split.
    background: {
      primary: "#FFFFFF",
      secondary: "#F7F7F5",
      tertiary: "#EDECEA",
    },

    surface: {
      primary: "#FFFFFF",
      secondary: "#F7F7F5",
    },

    border: "#E9E9E7",

    glass: {
      background: "#F7F7F5",
      hover: "rgba(0,0,0,.04)",
      active: "#191919",
    },

    text: {
      primary: "#37352F",
      secondary: "#787774",
      disabled: "#9B9A97",
    },

    primary: "#191919",
    secondary: "#787774",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#0EA5E9",
  },
};
