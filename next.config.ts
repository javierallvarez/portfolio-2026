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
      // Discogs CDN — cover art served from these hosts in the Discogs API responses.
      {
        protocol: "https",
        hostname: "i.discogs.com",
      },
      {
        protocol: "https",
        hostname: "img.discogs.com",
      },
    ],
  },
};

export default nextConfig;
