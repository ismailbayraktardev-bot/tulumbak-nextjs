import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker (disabled for Windows build)
  // output: 'standalone',

  // Base path for admin dashboard
  basePath: '/admin',

  // Asset prefix for admin dashboard
  assetPrefix: '/admin',

  // Performance optimizations
  poweredByHeader: false,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
    ],
    unoptimized: true, // For Docker compatibility
    formats: ['image/webp', 'image/avif'],
  },

  // External packages
  serverExternalPackages: ['pg', 'redis'],

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
