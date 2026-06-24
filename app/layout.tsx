import './globals.css';
import type { Metadata } from 'next';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

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
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div className="mx-auto max-w-[1440px] p-0 sm:p-6 lg:p-8">
          {/* The dark "device" shell, with the neon glow behind it. */}
          <div className="overflow-hidden rounded-none bg-gradient-to-b from-[#2b2b2e] to-[#202022] ring-1 ring-white/5 shadow-[0_0_140px_-30px_rgba(255,45,77,0.55),0_40px_120px_-40px_rgba(0,0,0,0.75)] sm:rounded-[30px]">
            <TopBar />
            <div className="flex gap-3 px-3 pb-5 sm:gap-4 sm:px-4 lg:px-5">
              <Sidebar />
              <main className="min-w-0 flex-1">
                <MobileNav />
                {children}
              </main>
            </div>
          </div>
          <p className="py-6 text-center text-xs text-neutral-500">
            SPAWN — gaming news, ranked by the community.
          </p>
        </div>
      </body>
    </html>
  );
}
