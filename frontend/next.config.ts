import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Desabilitar turbopack em produção para compatibilidade com Docker
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Configurações para Docker
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Configurações de imagem para Docker
  images: {
    unoptimized: true,
  },
  // Configurações para desenvolvimento com Docker
  allowedDevOrigins: ['192.168.0.25', 'localhost', '0.0.0.0'],
  // Configurações para evitar scroll
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
