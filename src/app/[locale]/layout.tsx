import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Barlow, Barlow_Condensed, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { routing } from '@/i18n/routing';
import '../globals.css';

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
  title: 'CES — Construction Equipment Services',
  description:
    'Sənaye və tikinti layihələri üçün avtokran, forklift, səbət və digər ağır texnikanın peşəkar icarəsi. Bakı, Azərbaycan.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${barlowSans.variable} ${barlowDisplay.variable} ${jetMono.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
