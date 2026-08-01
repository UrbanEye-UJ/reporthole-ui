import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

import L, { type LatLngTuple } from "leaflet";
import MapControls from "./MapControls";

const center: LatLngTuple = [-26.2041, 28.0473];

const assets = [
  {
    id: 1,
    name: "N1 North",
    type: "Highway",
    position: [-26.2041, 28.0473] as LatLngTuple,
  },
  {
    id: 2,
    name: "R21",
    type: "Regional Road",
    position: [-25.9206, 28.2069] as LatLngTuple,
  },
  {
    id: 3,
    name: "M1",
    type: "Urban Road",
    position: [-26.1703, 28.0416] as LatLngTuple,
  },
  {
    id: 4,
    name: "N3",
    type: "Highway",
    position: [-26.1502, 28.1405] as LatLngTuple,
  },
];

const markerIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const GautengMap = () => {
  return (
    <MapContainer
      center={center}
      zoom={9}
      scrollWheelZoom
      style={{
        height: "650px",
        width: "100%",
        borderRadius: "20px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapControls />

      {assets.map((asset) => (
        <Marker
          key={asset.id}
          position={asset.position}
          icon={markerIcon}
        >
          <Popup>
            <strong>{asset.name}</strong>

            <br />

            {asset.type}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default GautengMap;