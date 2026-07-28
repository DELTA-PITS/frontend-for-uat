import type { NextConfig } from "next";

const rootDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
