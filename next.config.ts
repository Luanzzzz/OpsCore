import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next-build",
  reactStrictMode: true,
  experimental: {
    webpackBuildWorker: false
  }
};

export default nextConfig;
