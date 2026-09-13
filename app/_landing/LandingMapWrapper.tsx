"use client";

/**
 * Client component wrapper so the Leaflet map (which uses `ssr: false`)
 * can be dynamically imported from the Server Component landing page.
 * Next.js 16 does not allow `ssr: false` inside Server Components directly.
 */

import dynamic from "next/dynamic";

const LandingGautengMap = dynamic(
  () => import("./LandingGautengMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          aspectRatio: "520/360",
          borderRadius: 18,
          background: "#F1F3F8",
          border: "1px solid #E3E7EE",
        }}
      />
    ),
  }
);

/** Renders the interactive Gauteng cluster map on the landing page. */
export default function LandingMapWrapper() {
  return <LandingGautengMap />;
}
