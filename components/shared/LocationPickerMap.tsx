"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon broken by webpack
const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface Props {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
}

function DraggableMarker({ latitude, longitude, onLocationChange }: Props) {
    const markerRef = useRef<L.Marker>(null);

    useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <Marker
            position={[latitude, longitude]}
            draggable
            icon={markerIcon}
            ref={markerRef}
            eventHandlers={{
                dragend() {
                    const m = markerRef.current;
                    if (m) {
                        const { lat, lng } = m.getLatLng();
                        onLocationChange(lat, lng);
                    }
                },
            }}
        />
    );
}

function RecenterMap({ latitude, longitude }: { latitude: number; longitude: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom());
    }, [latitude, longitude, map]);
    return null;
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange }: Props) {
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={16}
            style={{ height: "200px", width: "100%", borderRadius: "0.75rem" }}
            scrollWheelZoom={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <RecenterMap latitude={latitude} longitude={longitude} />
            <DraggableMarker latitude={latitude} longitude={longitude} onLocationChange={onLocationChange} />
        </MapContainer>
    );
}
