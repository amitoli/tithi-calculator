import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["astronomy-engine"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
