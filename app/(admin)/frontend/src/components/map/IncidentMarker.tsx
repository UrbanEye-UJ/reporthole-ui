import {
  CircleMarker,
  Popup,
} from "react-leaflet";

import type { LatLngTuple } from "leaflet";

interface IncidentMarkerProps {
  position: LatLngTuple;
  road: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: string;
}

const severityColors = {
  Low: "#22C55E",
  Medium: "#F59E0B",
  High: "#F97316",
  Critical: "#EF4444",
};

const IncidentMarker = ({
  position,
  road,
  severity,
  status,
}: IncidentMarkerProps) => {
  return (
    <CircleMarker
      center={position}
      radius={10}
      pathOptions={{
        color: severityColors[severity],
        fillColor: severityColors[severity],
        fillOpacity: 0.9,
        weight: 3,
      }}
    >
      <Popup>
        <strong>{road}</strong>

        <br />

        Severity: {severity}

        <br />

        Status: {status}
      </Popup>
    </CircleMarker>
  );
};

export default IncidentMarker;