"use client";

import { useMemo } from "react";

import "leaflet/dist/leaflet.css";

import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import L from "leaflet";
import { useTheme } from "@mui/material/styles";

import { useGetRecentIncidents, type AssignmentStatus } from "@/lib/hooks/useRecentIncidents";

import { formatIncidentType, STATUS_MAP } from "../tables/incidentColumns";
import type { Status } from "../ui/StatusBadge";

const buildPinIcon = (color: string) =>
  L.divIcon({
    className: "incident-marker",
    html: `<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9.7 13 25 13 25s13-15.3 13-25C26 5.8 20.2 0 13 0z" fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="1"/>
      <circle cx="13" cy="13" r="5.5" fill="#fff"/>
    </svg>`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    popupAnchor: [0, -32],
  });

const IncidentMapContent = () => {
  const theme = useTheme();
  const { data } = useGetRecentIncidents(10);
  const markers = (data?.data ?? []).filter(
    (incident): incident is typeof incident & { incidentId: string; latitude: number; longitude: number } =>
      incident.incidentId != null && incident.latitude != null && incident.longitude != null
  );

  const markerIcons = useMemo<Record<Status, L.DivIcon>>(
    () => ({
      Open: buildPinIcon(theme.palette.error.main),
      Assigned: buildPinIcon(theme.palette.warning.main),
      "In Progress": buildPinIcon(theme.palette.info.main),
      Resolved: buildPinIcon(theme.palette.success.main),
      Critical: buildPinIcon(theme.palette.error.main),
      Offline: buildPinIcon(theme.palette.text.disabled),
      Online: buildPinIcon(theme.palette.success.main),
    }),
    [theme]
  );

  return (
    <MapContainer
      center={[-26.2041, 28.0473]}
      zoom={10}
      scrollWheelZoom
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "16px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((incident) => {
        const status: Status = STATUS_MAP[(incident.status ?? "REPORTED") as AssignmentStatus] ?? "Open";

        return (
          <Marker
            key={incident.incidentId}
            position={[incident.latitude, incident.longitude]}
            icon={markerIcons[status]}
          >
            <Popup>
              <strong>{formatIncidentType(incident.incidentType)}</strong>

              <br />

              {incident.locationAddress || "Unknown location"}

              <br />

              Status: {status}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default IncidentMapContent;
