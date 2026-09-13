import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import ContractorProviders from "./_providers";

export const metadata: Metadata = {
  title: "Reporthole",
  description: "Manage and resolve assigned road infrastructure repairs.",
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
  themeColor: "#111111",
};

export default function ContractorLayout({ children }: { children: ReactNode }) {
  return <ContractorProviders>{children}</ContractorProviders>;
}
