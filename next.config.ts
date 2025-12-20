import type { NextConfig } from "next";
import { getSecurityHeaders } from "./lib/security-headers";

const nextConfig: NextConfig = {
  /* Security headers */
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
    ];
  },

  // Environment variable validation
  experimental: {
    // Enable strict mode for better security
    strictNextHead: true,
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,
};

export default nextConfig;
