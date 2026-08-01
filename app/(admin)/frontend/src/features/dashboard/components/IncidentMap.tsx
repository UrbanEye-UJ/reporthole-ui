import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import L, { type LatLngTuple } from "leaflet";

import Panel from "../../../components/ui/Panel";

interface Incident {
  id: number;
  title: string;
  road: string;
  status: string;
  position: LatLngTuple;
}

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const incidents: Incident[] = [
  {
    id: 1,
    title: "Large Pothole",
    road: "N1 North",
    status: "Open",
    position: [-26.2041, 28.0473],
  },
  {
    id: 2,
    title: "Road Crack",
    road: "R21",
    status: "Assigned",
    position: [-25.7461, 28.1881],
  },
  {
    id: 3,
    title: "Surface Collapse",
    road: "N3",
    status: "Critical",
    position: [-26.145, 28.045],
  },
];

const IncidentMap = () => {
  return (
    <Panel title="Incident Map">
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

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={incident.position}
            icon={markerIcon}
          >
            <Popup>
              <strong>{incident.title}</strong>

              <br />

              {incident.road}

              <br />

              Status: {incident.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Panel>
  );
};

export default IncidentMap;