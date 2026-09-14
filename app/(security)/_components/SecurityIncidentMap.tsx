"use client";

import { useMemo } from "react";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@mui/material/styles";

import { useGetRecentIncidents, type AssignmentStatus } from "@/lib/hooks/useRecentIncidents";
import { useGetIncidentClusters } from "@/lib/hooks/useIncidentClusters";
import type { MunicipalityBoundaryResponse } from "@/app/api/generated/openAPIDefinition.schemas";

/** Violet fill for the municipality boundary overlay — kept distinct from the theme's primary
 * color, which is near-white in dark mode and invisible against the OSM tile background. */
const ZONE_COLOR = "#8B5CF6";

export type SecurityMapView = "pins" | "clusters";

type Status = "Open" | "Assigned" | "In Progress" | "Resolved";

// REPORTED and VERIFIED both read as "Open" since neither has been assigned to a contractor yet
// — same vocabulary as the admin dashboard's incident table, kept as a local copy rather than an
// import so this route group has no coupling to the operational admin UI (see _components/ui.tsx).
const STATUS_MAP: Record<AssignmentStatus, Status> = {
  REPORTED: "Open",
  VERIFIED: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

const formatIncidentType = (type?: string) =>
  type
    ? type.toLowerCase().split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
    : "Unknown";

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
  if (size >= 5) return "#3B82F6";
  return "#22C55E";
}

/** Circle radius scales with cluster size (square-root to keep large clusters readable). */
function clusterRadius(size: number): number {
  return Math.min(55, Math.max(18, Math.sqrt(size) * 12));
}

interface Props {
  view: SecurityMapView;
  /** When omitted, incidents and clusters across every municipality are shown. */
  municipalityId?: string;
  /** Real Municipal Demarcation Board boundary for the selected municipality, from the
   * municipalities list response — undefined when "all municipalities" is selected, or when
   * that municipality has no boundary data on file yet. */
  boundary?: MunicipalityBoundaryResponse | null;
  /** When omitted, incidents and clusters of every issue type are shown. */
  issueType?: string;
}

/**
 * Leaflet map content for the SECURITY_ADMIN map view — unlike the operational admin
 * dashboard's map (scoped to one admin's own municipality), this shows whichever
 * municipality (or all of them) the security admin has picked from the page filter.
 */
const SecurityIncidentMap = ({ view, municipalityId, boundary, issueType }: Props) => {
  const theme = useTheme();

  const { data } = useGetRecentIncidents(200, municipalityId);
  const incidents = useMemo(
    () => (data?.data ?? []).filter(
      (i): i is typeof i & { incidentId: string; latitude: number; longitude: number } =>
        i.incidentId != null && i.latitude != null && i.longitude != null
        // GET /incidents/recent has no issue-type filter, so pins apply it client-side —
        // clusters below filter server-side instead, which keeps hotspot centroids correct.
        && (!issueType || i.incidentType === issueType)
    ),
    [data, issueType]
  );

  const { data: clusters = [] } = useGetIncidentClusters(7, issueType, municipalityId);

  const markerIcons = useMemo<Record<Status, L.DivIcon>>(
    () => ({
      Open: buildPinIcon(theme.palette.error.main),
      Assigned: buildPinIcon(theme.palette.warning.main),
      "In Progress": buildPinIcon(theme.palette.info.main),
      Resolved: buildPinIcon(theme.palette.success.main),
    }),
    [theme]
  );

  return (
    <MapContainer
      center={[-26.2041, 28.0473]}
      zoom={9}
      scrollWheelZoom
      style={{ width: "100%", height: "600px", borderRadius: "10px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Municipality boundary overlay — only when a single municipality is selected */}
      {boundary && (
        <GeoJSON
          key={municipalityId}
          data={boundary as unknown as GeoJSON.Geometry}
          style={{ stroke: false, fillColor: ZONE_COLOR, fillOpacity: 0.18 }}
        />
      )}

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
                <strong>{size} incident{size === 1 ? "" : "s"}</strong>
              </Popup>
            </CircleMarker>
          );
        })}
    </MapContainer>
  );
};

export default SecurityIncidentMap;
