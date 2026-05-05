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

const nextConfig: NextConfig = {
  allowedDevOrigins: localIP ? [localIP] : [],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
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
    ],
  },
};

export default nextConfig;
