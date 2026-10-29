import type { Metadata } from 'next';

import { AppProviders } from '@/components/app-providers';
import { SiteNav } from '@/components/site-nav';

import './globals.css';

export const metadata: Metadata = {
  title: 'Waivio Pages Starter',
  description: 'Static Next.js starter for query-api and Hive Keychain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <AppProviders>
          <SiteNav />
          <main className="mx-auto max-w-container-content px-gutter py-section-y">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
