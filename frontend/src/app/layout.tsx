import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

import { AuthProvider } from '@/context/AuthContext';
import { RootNavigationWrapper } from '@/components/RootNavigationWrapper';
import FloatingChat from '@/components/FloatingChat';
import FomoNotification from '@/components/FomoNotification';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SamStore - Top Up Game Termurah & Teraman',
  description: 'Topup diamond MLBB, Free Fire, PUBG Mobile instan otomatis 24/7 di SamStore. Harga reseller se-nusantara.',
  openGraph: {
    title: 'SamStore - Top Up Game Termurah',
    description: 'Platform Top Up Game Terpercaya & Pengiriman Instan 1 Detik! Tersedia Flash Sale setiap hari.',
    url: 'https://samstore.com',
    siteName: 'SamStore',
    images: [
      {
        url: '/images/fallback.png',
        width: 1200,
        height: 630,
        alt: 'SamStore Banner',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SamStore - Top Up Game Instan',
    description: 'Top Up Game Termurah Se-Indonesia. Proses 1 Detik!',
    images: ['/images/fallback.png'],
  },
};

async function fetchTheme() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/settings/theme`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.theme || 'default';
    }
  } catch (error) {
    console.warn("Could not fetch global theme:", error);
  }
  return 'default';
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const eventTheme = await fetchTheme();

  return (
    <html lang="id" data-event-theme={eventTheme} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <RootNavigationWrapper>
              {children}
              <FloatingChat />
              <FomoNotification />
            </RootNavigationWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
