import { configHeader } from '@/utils/constants';
import type { NextConfig } from "next";

/**
 * Parse NEXT_PUBLIC_BAGISTO_ENDPOINT into a remotePattern entry.
 * Returns an empty array if the URL is missing or invalid.
 */
function getBagistoRemotePattern(): NextConfig["images"]["remotePatterns"] {
  const endpoint = process.env.NEXT_PUBLIC_BAGISTO_ENDPOINT;

  if (!endpoint) {
    console.warn(
      "[next.config] NEXT_PUBLIC_BAGISTO_ENDPOINT is not set at build time. " +
      "Remote product images will NOT be optimized and may fail to load in production. " +
      "Make sure this env var is available in your CI/CD build environment."
    );
    // Fallback: allow any https hostname so images still load (no optimization, but no 402)
    return [{ protocol: "https", hostname: "**" }];
  }

  try {
    const url = new URL(endpoint);
    const protocol = url.protocol.replace(":", "") as "https" | "http";
    const hostname = url.hostname;
    const port = url.port || undefined;

    console.info(
      `[next.config] Registered remotePattern for image optimization: ${protocol}://${hostname}`
    );

    return [
      // Exact host from env (enables optimized delivery)
      { protocol, hostname, port, pathname: "/**" },
      // Safety fallback: allow any https host so images never 402 if env
      // differs between build-time and runtime (e.g., staging vs prod domain).
      { protocol: "https", hostname: "**" },
    ];
  } catch {
    console.warn(
      "[next.config] Invalid NEXT_PUBLIC_BAGISTO_ENDPOINT URL:",
      endpoint,
      "— falling back to wildcard https pattern."
    );
    return [{ protocol: "https", hostname: "**" }];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: getBagistoRemotePattern(),
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
