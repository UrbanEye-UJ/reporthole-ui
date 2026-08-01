export const colors = {
  dark: {
    background: {
      primary: "#07111F",
      secondary: "rgba(15, 23, 42, 0.72)",
      tertiary: "rgba(30, 41, 59, 0.55)",
    },

    surface: {
      primary: "rgba(17, 25, 40, 0.72)",
      secondary: "rgba(30, 41, 59, 0.60)",
    },

    border: "rgba(255,255,255,0.08)",

    glass: {
      background: "rgba(255,255,255,0.06)",
      hover: "rgba(59,130,246,.15)",
      active: "rgba(59,130,246,.22)",
    },

    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      disabled: "#64748B",
    },

    primary: "#3B82F6",
    secondary: "#06B6D4",

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#38BDF8",
  },

  light: {
    // Matches the civilian Tailwind palette exactly
    background: {
      primary: "#F3F4F6",   // gray-100
      secondary: "#FFFFFF",
      tertiary: "#F9FAFB",  // gray-50
    },

    surface: {
      primary: "#FFFFFF",   // white cards (civilian bg-white)
      secondary: "#F9FAFB", // gray-50 on hover
    },

    border: "#E5E7EB",      // gray-200

    glass: {
      background: "#FFFFFF",
      hover: "rgba(37,99,235,0.06)",   // blue-600 tint
      active: "rgba(37,99,235,0.12)",
    },

    text: {
      primary: "#1F2937",   // gray-800
      secondary: "#6B7280", // gray-500
      disabled: "#9CA3AF",  // gray-400
    },

    primary: "#2563EB",     // blue-600
    secondary: "#3B82F6",   // blue-500

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#0EA5E9",
  },
};
