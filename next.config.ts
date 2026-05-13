import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Pull the backend hostname out of NEXT_PUBLIC_API_BASE_URL so next/image
// will optimise admin-uploaded fleet / project / client images. When the
// backend URL changes (e.g. prod becomes https://api.ces.az), the pattern
// updates automatically — no manual config drift.
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
let apiPattern: { protocol: 'http' | 'https'; hostname: string; port?: string } | null = null;
try {
  const u = new URL(apiBase);
  apiPattern = {
    protocol: u.protocol.replace(':', '') as 'http' | 'https',
    hostname: u.hostname,
    ...(u.port ? { port: u.port } : {}),
  };
} catch {
  apiPattern = null;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'stevensoncrane.com' },
      ...(apiPattern ? [apiPattern] : []),
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default withNextIntl(nextConfig);
