/**
 * Notion-style scale: flatter than a typical rounded SaaS UI. `sm` is for
 * controls (buttons, inputs, nav items), `md` for cards/panels, `round` stays
 * for genuine pills/avatars/dots — never for a nav bar or top-level chrome.
 */
export const radius = {
  none: 0,

  xs: 3,

  sm: 6,

  md: 8,

  lg: 10,

  xl: 16,

  round: 9999,
} as const;
