import {
  Box,
  Typography,
} from "@mui/material";

const levels = [
  {
    label: "Very Low",
    color: "#22C55E",
  },
  {
    label: "Low",
    color: "#84CC16",
  },
  {
    label: "Medium",
    color: "#FACC15",
  },
  {
    label: "High",
    color: "#F97316",
  },
  {
    label: "Critical",
    color: "#EF4444",
  },
];

const HeatMapLegend = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,

        p: 2,

        borderRadius: 3,

        backdropFilter: "blur(18px)",

        bgcolor: "background.paper",

        border: "1px solid",

        borderColor: "divider",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 700,
        }}
      >
        Heatmap Legend
      </Typography>

      {levels.map((level) => (
        <Box
          key={level.label}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: 1,
              bgcolor: level.color,
            }}
          />

          <Typography variant="body2">
            {level.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default HeatMapLegend;