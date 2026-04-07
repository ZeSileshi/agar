import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@agar/shared', '@agar/i18n', '@agar/matching-engine'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
