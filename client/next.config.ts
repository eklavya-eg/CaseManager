// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* ... your other config options */

  // Add this configuration for Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Or any other size you need
    },
  },
};

export default nextConfig;