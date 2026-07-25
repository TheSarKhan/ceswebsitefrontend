import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { LegalPage } from '@/components/LegalPage';
import { PRIVACY } from '@/lib/legal-content';
import { alternatesFor, localeUrl, ogLocale, type Locale } from '@/lib/seo';

type Params = { locale: string };

export function generateStaticParams(): Params[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: 'Not found' };
  const loc = locale as Locale;
  const doc = PRIVACY[loc];
  const url = localeUrl(loc, '/mexfilik');
  return {
    title: `${doc.title} | CES`,
    description: doc.intro.slice(0, 160),
    alternates: { canonical: url, languages: alternatesFor('/mexfilik') },
    openGraph: { title: `${doc.title} | CES`, description: doc.intro.slice(0, 160), url, locale: ogLocale(loc), type: 'article' },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const loc = locale as Locale;
  return <LegalPage doc={PRIVACY[loc]} locale={loc} />;
}
