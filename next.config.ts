import type { NextConfig } from "next";

const rootDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

// Sub-path the app is served from; empty (root) for production. Same normalisation as lib/basePath.ts.
const rawBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim().replace(/\/+$/, "");
const basePath = rawBasePath === "" ? "" : rawBasePath.startsWith("/") ? rawBasePath : `/${rawBasePath}`;

const nextConfig: NextConfig = {
  basePath,
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
