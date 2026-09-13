"use client";

import { useMemo } from "react";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer, CircleMarker, Polygon } from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";
import { useTheme } from "@mui/material/styles";

import { useGetRecentIncidents, type AssignmentStatus } from "@/lib/hooks/useRecentIncidents";
import { useGetIncidentClusters } from "@/lib/hooks/useIncidentClusters";
import { formatIncidentType, STATUS_MAP } from "../tables/incidentColumns";
import type { Status } from "../ui/StatusBadge";
import type { MapView } from "./IncidentMap";

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

/** Heat-map colour based on incident count in a cluster. */
function clusterColor(size: number): string {
  if (size >= 20) return "#EF4444";
  if (size >= 10) return "#F59E0B";
  if (size >= 5)  return "#3B82F6";
  return "#22C55E";
}

/** Circle radius scales with cluster size (square-root to keep large clusters readable). */
function clusterRadius(size: number): number {
  return Math.min(55, Math.max(18, Math.sqrt(size) * 12));
}

/**
 * Approximate bounding polygons for the main Gauteng municipalities.
 * Used to highlight the admin's municipality zone on the map.
 * These are rough rectangles — accurate enough for orientation, not for legal boundaries.
 */
const MUNICIPALITY_ZONES: Record<string, LatLngTuple[]> = {
  "City of Johannesburg Metropolitan": [
    [-26.38, 27.84], [-25.97, 27.84], [-25.97, 28.18], [-26.38, 28.18],
  ],
  "City of Tshwane Metropolitan": [
    [-26.02, 27.88], [-25.48, 27.88], [-25.48, 28.58], [-26.02, 28.58],
  ],
  "City of Ekurhuleni Metropolitan": [
    [-26.47, 28.08], [-26.01, 28.08], [-26.01, 28.72], [-26.47, 28.72],
  ],
  "Sedibeng District": [
    [-26.82, 27.80], [-26.38, 27.80], [-26.38, 28.40], [-26.82, 28.40],
  ],
  "Emfuleni Local": [
    [-26.75, 27.85], [-26.45, 27.85], [-26.45, 28.20], [-26.75, 28.20],
  ],
  "West Rand District": [
    [-26.42, 27.28], [-25.88, 27.28], [-25.88, 27.90], [-26.42, 27.90],
  ],
  "Mogale City Local": [
    [-26.22, 27.55], [-25.88, 27.55], [-25.88, 27.92], [-26.22, 27.92],
  ],
  "Merafong City Local": [
    [-26.55, 26.85], [-26.15, 26.85], [-26.15, 27.30], [-26.55, 27.30],
  ],
  "Rand West City Local": [
    [-26.42, 27.28], [-26.18, 27.28], [-26.18, 27.58], [-26.42, 27.58],
  ],
};

interface Props {
  view: MapView;
  municipalityName?: string;
}

/**
 * Leaflet map content for the Operations Center.
 * Two view modes:
 *   - **pins**: one status-coloured marker per incident
 *   - **clusters**: K-means hotspot circles coloured by density
 * Also overlays the admin's municipality zone as a translucent polygon.
 */
const IncidentMapContent = ({ view, municipalityName }: Props) => {
  const theme = useTheme();

  const { data } = useGetRecentIncidents(200);
  const incidents = useMemo(
    () => (data?.data ?? []).filter(
      (i): i is typeof i & { incidentId: string; latitude: number; longitude: number } =>
        i.incidentId != null && i.latitude != null && i.longitude != null
    ),
    [data]
  );

  const { data: clusters = [] } = useGetIncidentClusters(7);

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

  const municipalityPolygon = municipalityName ? MUNICIPALITY_ZONES[municipalityName] : undefined;

  return (
    <MapContainer
      center={[-26.2041, 28.0473]}
      zoom={10}
      scrollWheelZoom
      style={{ width: "100%", height: "500px", borderRadius: "16px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Municipality zone overlay */}
      {municipalityPolygon && (
        <Polygon
          positions={municipalityPolygon}
          pathOptions={{
            color: theme.palette.primary.main,
            fillColor: theme.palette.primary.main,
            fillOpacity: 0.08,
            weight: 2,
            dashArray: "6 4",
          }}
        />
      )}

      {/* Incident pins view */}
      {view === "pins" && incidents.map((incident) => {
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

      {/* K-means hotspot view */}
      {view === "clusters" && clusters
        .filter((c) => c.centroidLatitude != null && c.centroidLongitude != null)
        .map((cluster) => {
          const lat = cluster.centroidLatitude!;
          const lng = cluster.centroidLongitude!;
          const size = cluster.size ?? 0;
          return (
            <CircleMarker
              key={cluster.clusterIndex}
              center={[lat, lng]}
              radius={clusterRadius(size)}
              pathOptions={{
                color: clusterColor(size),
                fillColor: clusterColor(size),
                fillOpacity: 0.45,
                weight: 2,
              }}
            >
              <Popup>
                <strong>Hotspot — {size} incident{size !== 1 ? "s" : ""}</strong>
                <br />
                Lat {lat.toFixed(4)}, Lng {lng.toFixed(4)}
              </Popup>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
};

export default IncidentMapContent;
