import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  'https://simon-ia-cv-analyzer.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

const nextConfig: NextConfig = {
  serverExternalPackages: ['mammoth'],

  async headers() {
    return [
      {
        // Seguridad general para todas las rutas
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',    value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // CORS solo para las rutas API
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: ALLOWED_ORIGINS[0], // dominio de producción
          },
          { key: 'Access-Control-Allow-Methods', value: 'POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
          { key: 'Access-Control-Max-Age',       value: '86400' },
        ],
      },
    ];
  },
};

export default nextConfig;
