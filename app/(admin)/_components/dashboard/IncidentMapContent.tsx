"use client";

import { useEffect, useMemo } from "react";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer, CircleMarker, GeoJSON, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@mui/material/styles";

/** Red outline + translucent red tint for the area outside the municipality boundary. */
const BORDER_COLOR = "#EF4444";

import { useGetRecentIncidents, type AssignmentStatus } from "@/lib/hooks/useRecentIncidents";
import { useGetIncidentClusters } from "@/lib/hooks/useIncidentClusters";
import type { MunicipalityBoundaryResponse } from "@/app/api/generated/openAPIDefinition.schemas";
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

/** Flattens a MultiPolygon's [lon, lat] positions into Leaflet [lat, lng] pairs. */
function boundaryToLatLngs(boundary: MunicipalityBoundaryResponse): L.LatLngExpression[] {
  const latLngs: L.LatLngExpression[] = [];
  (boundary.coordinates ?? []).forEach((polygon) =>
    polygon.forEach((ring) =>
      ring.forEach(([lng, lat]) => latLngs.push([lat, lng]))
    )
  );
  return latLngs;
}

/** Each ring of a MultiPolygon as its own Leaflet [lat, lng] ring (one per polygon part). */
function boundaryToRings(boundary: MunicipalityBoundaryResponse): L.LatLngExpression[][] {
  const rings: L.LatLngExpression[][] = [];
  (boundary.coordinates ?? []).forEach((polygon) =>
    polygon.forEach((ring) => rings.push(ring.map(([lng, lat]): L.LatLngExpression => [lat, lng])))
  );
  return rings;
}

/** Shoelace signed area — sign gives a ring's winding direction (only the sign matters here). */
function signedArea(ring: L.LatLngExpression[]): number {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [y1, x1] = ring[i] as [number, number];
    const [y2, x2] = ring[(i + 1) % ring.length] as [number, number];
    sum += x1 * y2 - x2 * y1;
  }
  return sum;
}

const WORLD_RING: L.LatLngExpression[] = [[-85, -180], [85, -180], [85, 180], [-85, 180]];

/**
 * Builds a "world minus boundary" ring set for tinting everything outside the municipality.
 * A Leaflet polygon's holes only render as holes when their winding is opposite the outer
 * ring's, so each boundary ring is flipped if needed to guarantee that.
 */
function buildOutsideRings(boundary: MunicipalityBoundaryResponse): L.LatLngExpression[][] {
  const outerSign = Math.sign(signedArea(WORLD_RING));
  const holes = boundaryToRings(boundary).map((ring) =>
    Math.sign(signedArea(ring)) === outerSign ? [...ring].reverse() : ring
  );
  return [WORLD_RING, ...holes];
}

/**
 * Frames the map to the municipality boundary on load and locks panning/zooming so the
 * admin can't scroll or zoom out past their own municipality.
 *
 * Uses a "cover" fit rather than Leaflet's default "contain" fit: it zooms in until the
 * boundary fills the entire panel (cropping the longer edge), instead of shrinking to fit
 * the whole boundary with letterboxed space around it.
 */
const LockToBoundary = ({ boundary }: { boundary: MunicipalityBoundaryResponse }) => {
  const map = useMap();

  useEffect(() => {
    const latLngs = boundaryToLatLngs(boundary);
    if (latLngs.length === 0) return;

    // Leaflet measures the container lazily; if this runs before the panel has taken its
    // final on-screen size, getBoundsZoom fits against a stale (too-small) size and locks
    // in a wrong minimum zoom. Force a re-measure immediately before using it.
    map.invalidateSize();

    const bounds = L.latLngBounds(latLngs);
    map.setMinZoom(0);
    // inside=true → the smallest zoom at which the map view fits entirely inside the
    // boundary's bounds, i.e. the boundary covers the whole panel with no letterboxing.
    const coverZoom = map.getBoundsZoom(bounds, true);
    map.setView(bounds.getCenter(), coverZoom);
    map.setMinZoom(coverZoom);
    map.setMaxBounds(bounds.pad(0.05));
  }, [map, boundary]);

  return null;
};

interface Props {
  view: MapView;
  /** Real Municipal Demarcation Board boundary for the map's municipality, for the zone overlay. */
  boundary?: MunicipalityBoundaryResponse | null;
  /** When provided, restricts both pins and clusters to this municipality (SECURITY_ADMIN map view). */
  municipalityId?: string;
}

/**
 * Leaflet map content for the Operations Center and the SECURITY_ADMIN map view.
 * Two view modes:
 *   - **pins**: one status-coloured marker per incident
 *   - **clusters**: K-means hotspot circles coloured by density
 * Also overlays the selected municipality's zone as a translucent polygon.
 */
const IncidentMapContent = ({ view, boundary, municipalityId }: Props) => {
  const theme = useTheme();

  const { data } = useGetRecentIncidents(200, municipalityId);
  const incidents = useMemo(
    () => (data?.data ?? []).filter(
      (i): i is typeof i & { incidentId: string; latitude: number; longitude: number } =>
        i.incidentId != null && i.latitude != null && i.longitude != null
    ),
    [data]
  );

  const { data: clusters = [] } = useGetIncidentClusters(7, undefined, municipalityId);

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
      maxBoundsViscosity={1.0}
      style={{ width: "100%", height: "500px", borderRadius: "16px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Municipality boundary — frames/locks the viewport; red outline, translucent red tint outside it */}
      {boundary && (
        <>
          <Polygon
            positions={buildOutsideRings(boundary)}
            pathOptions={{ stroke: false, fillColor: BORDER_COLOR, fillOpacity: 0.35 }}
            interactive={false}
          />
          <GeoJSON
            key={municipalityId}
            data={boundary as unknown as GeoJSON.Geometry}
            style={{ color: BORDER_COLOR, weight: 2, fill: false }}
          />
          <LockToBoundary boundary={boundary} />
        </>
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
