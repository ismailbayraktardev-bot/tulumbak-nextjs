// Tulumbak Configuration
export const config = {
  app: {
    name: 'Tulumbak',
    version: '0.1.0',
    description: 'Tulumbak E-commerce Platform',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
  },
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
};