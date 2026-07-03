import { configHeader } from '@/utils/constants';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75, 90],
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT
        ? (() => {
          try {
            const url = new URL(process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT);
            return [
              {
                protocol: url.protocol.replace(":", "") as "https" | "http",
                hostname: url.hostname,
                port: url.port || undefined,
                pathname: "/**",
              },
            ];
          } catch {
            console.warn(
              "Invalid NEXT_PUBLIC_BAGISTO_ENDPOINT URL:",
              process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT,
            );
            return [];
          }
        })()
        : (() => {
          console.warn(
            "NEXT_PUBLIC_BAGISTO_ENDPOINT is not set at build time. " +
            "Remote product images will NOT be optimized and will fail to load in production.",
          );
          return [];
        })()),
    ],
  },

  async headers() {
    return configHeader;
  },
  compress: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
