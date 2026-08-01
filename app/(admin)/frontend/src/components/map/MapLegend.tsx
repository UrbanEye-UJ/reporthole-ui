import {
  Box,
  Typography,
} from "@mui/material";

const legendItems = [
  {
    label: "Critical",
    color: "#EF4444",
  },
  {
    label: "High",
    color: "#F97316",
  },
  {
    label: "Medium",
    color: "#F59E0B",
  },
  {
    label: "Low",
    color: "#22C55E",
  },
];

const MapLegend = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 16,
        right: 16,
        zIndex: 1000,

        p: 2,
        minWidth: 180,

        borderRadius: 3,

        backdropFilter: "blur(20px)",
        background: "rgba(15, 23, 42, 0.75)",

        border: "1px solid",
        borderColor: "divider",

        boxShadow: 6,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          fontWeight: 700,
        }}
      >
        Incident Severity
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {legendItems.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: item.color,
                flexShrink: 0,
              }}
            />

            <Typography
              variant="body2"
              color="text.primary"
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MapLegend;