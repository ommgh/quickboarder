/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["res.cloudinary.com", "go-upc.s3.amazonaws.com"],
  },
};

export default nextConfig;
