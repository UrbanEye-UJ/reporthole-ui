import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-brand",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body className={`${plusJakarta.variable} ${ibmMono.variable}`}>
      <Providers>{children}</Providers>
      </body>
      </html>
  );
}