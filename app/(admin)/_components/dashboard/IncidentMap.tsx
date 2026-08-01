// Leaflet is browser-only — wrap in next/dynamic to prevent SSR crash.
import dynamic from "next/dynamic";

import Panel from "../ui/Panel";

const IncidentMapContent = dynamic(() => import("./IncidentMapContent"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "500px", borderRadius: "16px", background: "rgba(17,25,40,.72)" }} />
  ),
});

const IncidentMap = () => {
  return (
    <Panel title="Incident Map">
      <IncidentMapContent />
    </Panel>
  );
};

export default IncidentMap;
