import type { NextConfig } from "next";
import createMDX from "@next/mdx";
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
const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
