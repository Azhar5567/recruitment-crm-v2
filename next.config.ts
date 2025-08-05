import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Fix for bootstrap script issue
    optimizePackageImports: ['lucide-react'],
  },
  // Ensure proper client-side hydration
  reactStrictMode: true,
};

export default nextConfig;
