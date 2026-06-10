import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['taskflow-attachments.s3.amazonaws.com'],
  },
};

export default nextConfig;
