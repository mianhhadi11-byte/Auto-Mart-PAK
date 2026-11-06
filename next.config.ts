import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default nextConfig;
