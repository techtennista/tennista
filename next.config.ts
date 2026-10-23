import type { NextConfig } from "next";

function storageHostname() {
  const endpoint = process.env.NEON_STORAGE_ENDPOINT;
  if (!endpoint) return null;
  try {
    return new URL(endpoint).hostname;
  } catch {
    return null;
  }
}

const neonStorageHost = storageHostname();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: neonStorageHost
      ? [
          {
            protocol: "https",
            hostname: neonStorageHost,
            pathname: "/**",
          },
        ]
      : [
          {
            protocol: "https",
            hostname: "*.aws.neon.tech",
            pathname: "/**",
          },
        ],
  },
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;
