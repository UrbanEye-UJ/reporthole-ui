"use client";

import { Stack, Fab, Tooltip } from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";

import { useMap } from "react-leaflet";

const DEFAULT_CENTER: [number, number] = [-26.2041, 28.0473];
const DEFAULT_ZOOM = 9;

const MapControls = () => {
  const map = useMap();

  const zoomIn = () => map.zoomIn();

  const zoomOut = () => map.zoomOut();

  const resetView = () => {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
      }}
    >
      <Tooltip title="Zoom In">
        <Fab
          size="small"
          color="primary"
          onClick={zoomIn}
          sx={{
            backdropFilter: "blur(18px)",
            bgcolor: "rgba(255,255,255,.12)",

            "&:hover": {
              bgcolor: "primary.main",
            },
          }}
        >
          <AddRoundedIcon />
        </Fab>
      </Tooltip>

      <Tooltip title="Zoom Out">
        <Fab
          size="small"
          color="primary"
          onClick={zoomOut}
          sx={{
            backdropFilter: "blur(18px)",
            bgcolor: "rgba(255,255,255,.12)",

            "&:hover": {
              bgcolor: "primary.main",
            },
          }}
        >
          <RemoveRoundedIcon />
        </Fab>
      </Tooltip>

      <Tooltip title="Reset View">
        <Fab
          size="small"
          color="primary"
          onClick={resetView}
          sx={{
            backdropFilter: "blur(18px)",
            bgcolor: "rgba(255,255,255,.12)",

            "&:hover": {
              bgcolor: "primary.main",
            },
          }}
        >
          <MyLocationRoundedIcon />
        </Fab>
      </Tooltip>
    </Stack>
  );
};

export default MapControls;
