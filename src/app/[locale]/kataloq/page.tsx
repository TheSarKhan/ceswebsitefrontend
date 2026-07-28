import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Contact } from '@/components/Contact';
import { CatalogFull } from '@/components/CatalogFull';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema, breadcrumbSchema } from '@/lib/schema';
import { alternatesFor, localeUrl, type Locale } from '@/lib/seo';
import { serverFetch } from '@/lib/api';
import type { FleetCategoryDto } from '@/lib/types';

export const revalidate = 600;

const META: Record<Locale, { title: string; description: string; crumb: string; home: string }> = {
  az: {
    title: 'Texnika Kataloqu — bütün texnika parkı | CES',
    description:
      'CES texnika parkının tam kataloqu — avtokran, forklift, teleskopik yükləyici, ekskavator, hündürlük səbəti, buldozer və daha çoxu. Kateqoriyalar üzrə bax, operatorla icarə et.',
    crumb: 'Kataloq',
    home: 'Ana səhifə',
  },
  ru: {
    title: 'Каталог техники — весь парк | CES',
    description:
      'Полный каталог парка техники CES — автокраны, погрузчики, телескопические погрузчики, экскаваторы, подъёмники, бульдозеры и другое. Смотрите по категориям, арендуйте с оператором.',
    crumb: 'Каталог',
    home: 'Главная',
  },
  en: {
    title: 'Equipment Catalog — full fleet | CES',
    description:
      'The complete CES equipment fleet catalog — mobile cranes, forklifts, telehandlers, excavators, aerial lifts, bulldozers and more. Browse by category and rent with an operator.',
    crumb: 'Catalog',
    home: 'Home',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: 'Not found' };
  const loc = locale as Locale;
  const m = META[loc];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: localeUrl(loc, '/kataloq'), languages: alternatesFor('/kataloq') },
    openGraph: {
      title: m.title,
      description: m.description,
      url: localeUrl(loc, '/kataloq'),
    },
  };
}

export default async function KataloqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale as Locale;
  const categories = await serverFetch<FleetCategoryDto[]>(
    '/api/v1/public/fleet/categories',
  );

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(loc),
          breadcrumbSchema([
            { name: META[loc].home, url: localeUrl(loc) },
            { name: META[loc].crumb, url: localeUrl(loc, '/kataloq') },
          ]),
        ]}
      />

      <SiteHeader />
      {/* No `site-body` here — <body> already carries it, and applying the
          fixed-header offset twice left a ~110px empty band under the nav. */}
      <main>
        <CatalogFull initialCategories={categories ?? undefined} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
