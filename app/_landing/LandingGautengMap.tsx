"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { LatLngTuple } from "leaflet";

const CENTER: LatLngTuple = [-26.05, 28.05];

/**
 * Illustrative cluster markers scattered across major Gauteng localities.
 * These are static demo pins — the real incident map in the admin dashboard
 * pulls live data from the API.
 */
const DEMO_CLUSTERS: { pos: LatLngTuple; count: number; label: string }[] = [
  { pos: [-26.2041, 28.0473], count: 14, label: "Johannesburg CBD" },
  { pos: [-26.1076, 28.0567], count: 9, label: "Sandton" },
  { pos: [-25.7461, 28.1881], count: 11, label: "Pretoria" },
  { pos: [-25.9969, 28.1281], count: 6, label: "Midrand" },
  { pos: [-26.2676, 27.859], count: 8, label: "Soweto" },
  { pos: [-26.2163, 28.172], count: 5, label: "Ekurhuleni" },
  { pos: [-25.8614, 28.1888], count: 7, label: "Centurion" },
  { pos: [-26.3865, 27.9064], count: 4, label: "Vereeniging" },
  { pos: [-26.1423, 27.9056], count: 3, label: "Roodepoort" },
  { pos: [-26.0767, 28.3], count: 5, label: "Tembisa" },
];

/** Maps a report count to a circle radius (8–22 px). */
const radius = (count: number) => Math.round(8 + (count / 14) * 14);

export default function LandingGautengMap() {
  return (
    <MapContainer
      center={CENTER}
      zoom={9}
      scrollWheelZoom={false}
      zoomControl={false}
      attributionControl={false}
      style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {DEMO_CLUSTERS.map(({ pos, count, label }) => (
        <CircleMarker
          key={label}
          center={pos}
          radius={radius(count)}
          pathOptions={{
            color: "#111111",
            fillColor: "#111111",
            fillOpacity: 0.70,
            weight: 2,
            opacity: 0.9,
          }}
        >
          <Tooltip direction="top" offset={[0, -radius(count)]} opacity={0.92}>
            <span style={{ fontWeight: 600 }}>{label}</span>
            <br />
            {count} reported incidents
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
