import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';

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
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</main>
        <footer className="border-t border-neutral-900 py-8 text-center text-xs text-neutral-600">
          SPAWN — gaming news, ranked by the community.
        </footer>
      </body>
    </html>
  );
}
