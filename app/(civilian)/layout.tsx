import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import CivilianProviders from "./_providers";

export const metadata: Metadata = {
  title: "Reporthole",
  description: "Report road issues in your area and help improve infrastructure for everyone.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reporthole",
  },
  icons: {
    // iOS ignores the web manifest's icons — it only reads this link tag.
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#191919",
};

export default function CivilianLayout({ children }: { children: ReactNode }) {
  return <CivilianProviders>{children}</CivilianProviders>;
}
