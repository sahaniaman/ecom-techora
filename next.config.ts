import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/your-cloud-name/**',
      },
    ],
    // Optional: Image optimization settings
    formats: ['image/webp', 'image/avif'],
  }
};

export default nextConfig;
