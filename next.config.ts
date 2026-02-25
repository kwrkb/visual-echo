import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 既存DBレコードに残る可能性がある外部URLに限定して許可
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;
