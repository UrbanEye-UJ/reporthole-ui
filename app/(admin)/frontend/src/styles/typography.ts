export const typography = {
  fontFamily: [
    "Inter",
    "Roboto",
    '"Segoe UI"',
    "Helvetica",
    "Arial",
    "sans-serif",
  ].join(","),

  h1: {
    fontSize: "3rem",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  h2: {
    fontSize: "2.5rem",
    fontWeight: 700,
    lineHeight: 1.25,
  },

  h3: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },

  h4: {
    fontSize: "1.75rem",
    fontWeight: 700,
    lineHeight: 1.3,
  },

  h5: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },

  h6: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },

  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
  },

  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
  },

  body1: {
    fontSize: "1rem",
    fontWeight: 400,
  },

  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
  },

  button: {
    textTransform: "none" as const,
    fontWeight: 600,
  },

  caption: {
    fontSize: "0.75rem",
  },

  overline: {
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
};