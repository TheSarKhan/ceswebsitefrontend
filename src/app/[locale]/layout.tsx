import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Poppins } from 'next/font/google';
import { QueryProvider } from '@/components/QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { routing } from '@/i18n/routing';
import { alternatesFor, localeUrl, ogLocale, SITE_URL, type Locale } from '@/lib/seo';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

type LocaleCopy = {
  title: string;
  description: string;
  siteName: string;
};

const COPY: Record<Locale, LocaleCopy> = {
  az: {
    title: 'CES — Bakıda peşəkar texnika icarəsi',
    description:
      'Sənaye və tikinti layihələri üçün avtokran, forklift, yüksəklik səbəti, ekskavator və digər ağır texnikanın peşəkar icarəsi. Bakı və Sumqayıt, Azərbaycan.',
    siteName: 'CES — Construction Equipment Services',
  },
  ru: {
    title: 'CES — Профессиональная аренда техники в Баку',
    description:
      'Аренда автокранов, погрузчиков, подъемников и другой тяжелой техники для промышленных и строительных проектов. Баку и Сумгаит, Азербайджан.',
    siteName: 'CES — Construction Equipment Services',
  },
  en: {
    title: 'CES — Construction Equipment Rental in Baku',
    description:
      'Professional rental of cranes, forklifts, lifts, excavators and heavy machinery for industrial and construction projects in Baku and Sumgait, Azerbaijan.',
    siteName: 'CES — Construction Equipment Services',
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return { title: 'CES', description: '' };
  }
  const copy = COPY[locale as Locale];
  const url = localeUrl(locale as Locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: copy.title, template: `%s — ${copy.siteName}` },
    description: copy.description,
    applicationName: copy.siteName,
    icons: {
      icon: '/icon.png',
      shortcut: '/icon.png',
      apple: '/icon.png',
    },
    alternates: {
      canonical: url,
      languages: alternatesFor(),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: copy.siteName,
      locale: ogLocale(locale as Locale),
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => ogLocale(l as Locale)),
      type: 'website',
      images: [
        {
          url: '/icon.png',
          width: 512,
          height: 512,
          alt: copy.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: ['/icon.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
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
      className={poppins.variable}
      suppressHydrationWarning
    >
      <body className="site-body" suppressHydrationWarning>
        <NextIntlClientProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
