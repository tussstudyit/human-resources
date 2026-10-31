import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      {
        source: '/bieu-mau-danh-gia-360.html',
        destination: '/bieu-mau-danh-gia-360',
      },
      {
        source: '/review-360.html',
        destination: '/review-360',
      },
    ];
  },
};

export default nextConfig;
