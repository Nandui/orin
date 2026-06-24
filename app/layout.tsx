import './globals.css';
import type { Metadata } from 'next';
import { TopNav } from '@/components/layout/TopNav';

export const metadata: Metadata = {
  title: 'SPAWN — Gaming news, ranked by the community',
  description:
    'A gaming-specific news aggregator. Crawls top outlets, clusters stories, and ranks them by a decay-weighted engagement score.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    title: 'SPAWN /Gaming',
    description: 'Gaming news, ranked by the community.',
    siteName: 'SPAWN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <TopNav />
        <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-5 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-600">
          SPAWN — gaming news, ranked by the community.
        </footer>
      </body>
    </html>
  );
}
