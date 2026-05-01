import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/arena/:path*',
        destination: '/rooms/:path*',
      },
    ];
  },
};

export default nextConfig;
