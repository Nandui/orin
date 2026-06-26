import './globals.css';
import type { Metadata, Viewport } from 'next';
import { SideNav } from '@/components/layout/SideNav';

export const viewport: Viewport = {
  themeColor: '#000000',
  // Let content extend into the notch/home-indicator so our fixed bars can pad
  // themselves with env(safe-area-inset-*).
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'SPAWN — Gaming news as it happens',
  description:
    'A gaming-specific news feed. Crawls top outlets, clusters stories, and surfaces the latest as it happens.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    title: 'SPAWN',
    description: 'Gaming news as it happens.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <div className="mx-auto flex w-full max-w-[1290px]">
          <SideNav />
          {/* Content area — pages lay out their own center feed + right rail.
              Top/bottom padding clears the fixed mobile bars incl. safe areas. */}
          <div className="min-w-0 flex-1 pt-[calc(3.5rem_+_env(safe-area-inset-top))] pb-[calc(4rem_+_env(safe-area-inset-bottom))] lg:pt-0 lg:pb-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
