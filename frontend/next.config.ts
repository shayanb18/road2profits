import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // The landing page is a static page built with a design kit (public/home); its CSS stays out of the app.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/home/index.html" }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;
