import './globals.css';
import type { Metadata } from 'next';
import { TopNav } from '@/components/layout/TopNav';

// Edition dateline for the masthead — computed server-side so it never drifts
// between server and client render.
function editionDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&family=UnifrakturCook:wght@700&display=swap"
          rel="stylesheet"
        />
        <TopNav today={editionDate()} />
        <main className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 sm:px-6">
          {children}
        </main>
        <footer className="mt-8 border-t border-white/10 py-8 text-center">
          <p className="font-masthead text-2xl text-white">SPAWN</p>
          <p className="kicker mt-1 text-[11px] text-neutral-600">
            The Gaming Daily · News as it happens
          </p>
        </footer>
      </body>
    </html>
  );
}
