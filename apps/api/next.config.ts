import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker
  output: 'standalone',

  // API configuration
  experimental: {
    // Optimize for API routes
    serverComponentsExternalPackages: ['pg', 'redis'],
  },

  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for API health check
  async redirects() {
    return [
      {
        source: '/api',
        destination: '/api/health',
        permanent: false,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
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
        ],
      },
    ];
  },
};

export default nextConfig;
