import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "garageimages.blob.core.windows.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
