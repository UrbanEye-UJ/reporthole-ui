export const shadows = {
  none: "none",

  xs: "0 2px 8px rgba(0, 0, 0, 0.12)",

  sm: "0 4px 12px rgba(0, 0, 0, 0.18)",

  md: "0 8px 24px rgba(0, 0, 0, 0.25)",

  lg: "0 16px 40px rgba(0, 0, 0, 0.35)",

  xl: "0 24px 64px rgba(0, 0, 0, 0.45)",

  card: `
    0 8px 32px rgba(15, 23, 42, 0.35),
    0 0 20px rgba(59, 130, 246, 0.08)
  `,

  glass: `
    0 8px 32px rgba(15, 23, 42, 0.30),
    inset 0 1px 0 rgba(255,255,255,0.08)
  `,

  hover: `
    0 12px 36px rgba(15,23,42,.45),
    0 0 24px rgba(59,130,246,.18)
  `,

  glowBlue: "0 0 24px rgba(59,130,246,.35)",

  glowPink: "0 0 24px rgba(236,72,153,.35)",

  glowSuccess: "0 0 24px rgba(34,197,94,.35)",

  glowWarning: "0 0 24px rgba(245,158,11,.35)",

  glowDanger: "0 0 24px rgba(239,68,68,.35)",
} as const;
