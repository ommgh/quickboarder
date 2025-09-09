import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "go-upc.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "bk1fbtmyym.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
