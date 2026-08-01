// Leaflet is browser-only — wrap in next/dynamic to prevent SSR crash.
import dynamic from "next/dynamic";

const GautengMap = dynamic(() => import("./GautengMapContent"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "650px",
        borderRadius: "20px",
        background: "rgba(17,25,40,.72)",
      }}
    />
  ),
});

export default GautengMap;
