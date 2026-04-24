import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash CDN — used for placeholder hero image on the Interactive Lab page.
      // Replace with your own CDN origin once real photos are uploaded.
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
