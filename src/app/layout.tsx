import type { Metadata } from 'next';

import { AppProviders } from '@/components/app-providers';
import { SiteBanner } from '@/components/site-banner';
import { SiteHeader } from '@/components/site-header';
import { SiteNav } from '@/components/site-nav';

import './globals.css';

export const metadata: Metadata = {
  title: 'CoffeeShop.Gifts',
  description: 'Coffee recipes, shop, map, and community on the Open Data Layer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <AppProviders>
          <SiteHeader />
          <SiteBanner />
          <SiteNav />
          <main className="site-main">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
