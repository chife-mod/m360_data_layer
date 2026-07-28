import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/m360_data_layer",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/m360_data_layer",
  },
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
