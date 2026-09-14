"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Box, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import GrainRoundedIcon from "@mui/icons-material/GrainRounded";

import Panel from "../ui/Panel";
import { useGetProfile } from "@/app/api/generated/user-profile/user-profile";

export type MapView = "pins" | "clusters";

const IncidentMapContent = dynamic(() => import("./IncidentMapContent"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "500px", borderRadius: "16px", background: "rgba(17,25,40,.12)" }} />
  ),
});

/**
 * Incident Map panel for the Operations Center.
 * Owns the view-mode toggle (Incidents / Hotspots) and passes the admin's
 * municipality boundary to the map content for the zone overlay.
 */
const IncidentMap = () => {
  const [view, setView] = useState<MapView>("pins");
  const { data } = useGetProfile({ query: { staleTime: 1000 * 60 * 5 } });
  const boundary = data?.data?.municipalityBoundary;

  return (
    <Panel>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: ".3px" }}>
          Incident Map
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => { if (v) setView(v); }}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              px: 2,
              py: 0.75,
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "8px !important",
              border: "1px solid",
              borderColor: "divider",
              textTransform: "none",
            },
          }}
        >
          <ToggleButton value="pins">
            <LocationOnRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Incidents
          </ToggleButton>
          <ToggleButton value="clusters">
            <GrainRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Hotspots
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <IncidentMapContent view={view} boundary={boundary} />
    </Panel>
  );
};

export default IncidentMap;
