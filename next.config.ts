import type { NextConfig } from "next";

// When served from a sub-path (e.g. https://rayzold.github.io/dryicecreation) set
// NEXT_PUBLIC_BASE_PATH=/dryicecreation at build time. Leave empty on the real domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // keeps the WordPress URL shape: /slug/ -> /slug/index.html
  basePath: basePath || undefined,
  images: { unoptimized: true },
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
