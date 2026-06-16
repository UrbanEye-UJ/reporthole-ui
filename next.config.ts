import os from "os";
import type { NextConfig } from "next";

const getLocalIP = (): string | null => {
    for (const iface of Object.values(os.networkInterfaces())) {
        for (const alias of iface ?? []) {
            if (alias.family === "IPv4" && !alias.internal) {
                return alias.address;
            }
        }
    }
    return null;
};

const localIP = getLocalIP();

const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: localIP ? [localIP] : [],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
      },
    ],
  },
};

export default nextConfig;
