import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MIC TECH — The signal in technology',
    short_name: 'MIC TECH',
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#080a0b',
    theme_color: '#080a0b',
    icons: [
      { src: '/icon.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
      { src: '/brand/mic-tech-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    categories: ['news', 'technology'],
  };
}
