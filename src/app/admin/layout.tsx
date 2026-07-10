import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Poppins } from 'next/font/google';
import { AdminAuthProvider } from '@/lib/admin-auth';
import { QueryProvider } from '@/components/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AdminGate } from '@/components/admin/AdminGate';
import { ToastProvider } from '@/components/admin/ToastProvider';
import '../globals.css';
import './admin.css';

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CES Admin',
  robots: { index: false, follow: false },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="az"
      className={poppins.variable}
      suppressHydrationWarning
    >
      <body className="admin-body" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <AdminAuthProvider>
              <ToastProvider>
                <AdminGate>{children}</AdminGate>
              </ToastProvider>
            </AdminAuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
