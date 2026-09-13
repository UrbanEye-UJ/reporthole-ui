"use client";

import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";
import MapControls from "./MapControls";
import { useGetRecentIncidents } from "@/app/api/generated/incidents/incidents";

const CENTER: LatLngTuple = [-26.2041, 28.0473];

/** Standard blue Leaflet pin — one icon instance shared across all markers. */
const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

function formatType(type?: string) {
    return type ? type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "Unknown";
}

const GautengMapContent = () => {
    // Fetch up to 200 most recent incidents — enough to give a meaningful geographic spread.
    const { data } = useGetRecentIncidents({ limit: 200 });
    const incidents = data?.data ?? [];

    // Keep only incidents that have valid coordinates.
    const pinnable = incidents.filter(
        (i) => typeof i.latitude === "number" && typeof i.longitude === "number"
    );

    return (
        <MapContainer
            center={CENTER}
            zoom={9}
            scrollWheelZoom
            style={{ height: "650px", width: "100%", borderRadius: "20px" }}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapControls />

            {pinnable.map((incident) => (
                <Marker
                    key={incident.incidentId}
                    position={[incident.latitude!, incident.longitude!]}
                    icon={markerIcon}
                >
                    <Popup>
                        <strong>{formatType(incident.incidentType)}</strong>
                        <br />
                        Status: {incident.status ?? "—"}
                        <br />
                        Reports: {incident.reportCount ?? 1}
                    </Popup>
                </Marker>
            ))}

            {pinnable.length === 0 && (
                // Invisible marker at centre just to keep the map interactive when empty.
                // No actual pin rendered — the map itself communicates "no data" visually.
                <></>
            )}
        </MapContainer>
    );
};

export default GautengMapContent;
