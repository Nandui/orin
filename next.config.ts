import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ESLint isn't wired up for this bootstrap; keep type-checking on but don't
  // let lint block a deploy.
  eslint: { ignoreDuringBuilds: true },
  // Story thumbnails come from arbitrary outlet domains; we render them with a
  // plain <img>, but allow next/image too in case it's adopted later.
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
