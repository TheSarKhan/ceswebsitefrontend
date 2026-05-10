import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Barlow, Barlow_Condensed, JetBrains_Mono } from 'next/font/google';
import { AdminAuthProvider } from '@/lib/admin-auth';
import { QueryProvider } from '@/components/QueryProvider';
import { AdminGate } from '@/components/admin/AdminGate';
import { ToastProvider } from '@/components/admin/ToastProvider';
import '../globals.css';
import './admin.css';

const barlowSans = Barlow({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
});
const barlowDisplay = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});
const jetMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-jet-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CES Admin',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="az"
      data-theme="dark"
      className={`${barlowSans.variable} ${barlowDisplay.variable} ${jetMono.variable}`}
    >
      <body className="admin-body">
        <QueryProvider>
          <AdminAuthProvider>
            <ToastProvider>
              <AdminGate>{children}</AdminGate>
            </ToastProvider>
          </AdminAuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
