import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { TopBar, Nav } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Contact } from '@/components/Contact';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema, breadcrumbSchema } from '@/lib/schema';
import { alternatesFor, localeUrl, ogLocale, SITE_URL, type Locale } from '@/lib/seo';
import { serverFetch } from '@/lib/api';
import { CITIES } from '@/lib/cities';
import type { FleetCategoryDto } from '@/lib/types';
import { pickTr } from '@/lib/types';

export const revalidate = 600;

const LOCALE_LANG = { az: 'AZ', ru: 'RU', en: 'EN' } as const;

const HUB_COPY: Record<Locale, {
  title: string;
  description: string;
  h1: string;
  lead: string;
  catHeading: string;
  cityHeading: string;
  matrixHeading: string;
  matrixLead: string;
  unitsLabel: string;
  crumbHome: string;
  crumbRent: string;
}> = {
  az: {
    title: 'Texnika icarəsi — bütün şəhərlər və kateqoriyalar | CES',
    description: 'Bakı, Sumqayıt, Abşeron, Şirvan, Gəncə — bütün şəhərlərdə avtokran, forklift, ekskavator, hündürlük səbəti icarəsi. CES — 120+ vahidlik park, operatorlu icarə.',
    h1: 'Bütün texnika kateqoriyaları və xidmət ərazisi',
    lead: 'CES texnika icarəsi şəbəkəsi — Azərbaycanın 5 əsas sənaye mərkəzini əhatə edir. Aşağıdan kateqoriya və ya şəhər seçin, və ya birbaşa konkret kombinasiyaya keçin.',
    catHeading: 'Kateqoriyalar',
    cityHeading: 'Xidmət ərazisi',
    matrixHeading: 'Bütün kombinasiyalar',
    matrixLead: 'Hər kateqoriya hər şəhərdə mövcuddur. Sizin axtardığınız spesifik səhifəyə keçid:',
    unitsLabel: 'vahid',
    crumbHome: 'Ana səhifə',
    crumbRent: 'Texnika icarəsi',
  },
  ru: {
    title: 'Аренда техники — все города и категории | CES',
    description: 'Аренда автокранов, погрузчиков, экскаваторов и подъёмников в Баку, Сумгаите, Абшероне, Ширване и Гяндже. CES — парк 120+ единиц, аренда с оператором.',
    h1: 'Все категории техники и зона обслуживания',
    lead: 'Сеть аренды техники CES охватывает 5 ключевых промышленных центров Азербайджана. Выберите категорию или город ниже, или перейдите к конкретной комбинации.',
    catHeading: 'Категории',
    cityHeading: 'Зона обслуживания',
    matrixHeading: 'Все комбинации',
    matrixLead: 'Каждая категория доступна в каждом городе. Перейдите к нужной странице:',
    unitsLabel: 'ед.',
    crumbHome: 'Главная',
    crumbRent: 'Аренда техники',
  },
  en: {
    title: 'Equipment rental — all cities & categories | CES',
    description: 'Rent cranes, forklifts, excavators, and aerial platforms in Baku, Sumgait, Absheron, Shirvan, and Ganja. CES — 120+ unit fleet, rental with operator.',
    h1: 'All equipment categories and service area',
    lead: 'CES equipment rental network covers 5 key industrial centres of Azerbaijan. Pick a category or city below, or jump straight to a specific combination.',
    catHeading: 'Categories',
    cityHeading: 'Service area',
    matrixHeading: 'All combinations',
    matrixLead: 'Every category is available in every city. Jump to the page you need:',
    unitsLabel: 'units',
    crumbHome: 'Home',
    crumbRent: 'Equipment rental',
  },
};

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: 'Rent' };
  const copy = HUB_COPY[locale as Locale];
  const url = localeUrl(locale as Locale, '/rent');
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: alternatesFor('/rent'),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: 'CES — Construction Equipment Services',
      locale: ogLocale(locale as Locale),
      type: 'website',
      images: [{ url: '/icon.png', width: 512, height: 512 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: ['/icon.png'],
    },
  };
}

export default async function RentHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale as Locale;
  const lang = LOCALE_LANG[loc];
  const copy = HUB_COPY[loc];

  const categories =
    (await serverFetch<FleetCategoryDto[]>('/api/v1/public/fleet/categories')) ?? [];
  // Only show categories that actually have published items, otherwise the
  // matrix produces dead pages.
  const liveCategories = categories.filter((c) =>
    c.subcategories.some((s) => (s.itemCount ?? 0) > 0),
  );

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(loc),
          breadcrumbSchema([
            { name: copy.crumbHome, url: localeUrl(loc) },
            { name: copy.crumbRent, url: localeUrl(loc, '/rent') },
          ]),
        ]}
      />

      <TopBar />
      <Nav />

      <main className="rent-page">
        {/* ===== HERO ===== */}
        <section className="section-pad rent-hero">
          <div className="container">
            <div className="eyebrow">▸ {copy.crumbRent}</div>
            <h1 className="rent-h1">{copy.h1}</h1>
            <p className="rent-lead">{copy.lead}</p>
          </div>
        </section>

        {/* ===== CATEGORIES ===== */}
        <section className="section-pad" style={{ background: 'var(--bg-2)' }}>
          <div className="container">
            <h2 className="rent-h2">{copy.catHeading}</h2>
            <div className="rent-grid">
              {liveCategories.map((c) => {
                const tr = pickTr(c.translations, lang);
                const total = c.subcategories.reduce(
                  (s, x) => s + (x.itemCount ?? 0),
                  0,
                );
                return (
                  <a
                    key={c.slug}
                    href={`/${loc}#fleet-${c.slug}`}
                    className="rent-card"
                  >
                    <h3>{tr?.name ?? c.slug}</h3>
                    <span className="rent-card-count">
                      {total} {copy.unitsLabel}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CITIES ===== */}
        <section className="section-pad">
          <div className="container">
            <h2 className="rent-h2">{copy.cityHeading}</h2>
            <div className="rent-grid">
              {CITIES.map((city) => (
                <div key={city.slug} className="rent-card rent-card-city">
                  <h3>{city.name[loc]}</h3>
                  <p className="rent-card-meta">{city.delivery[loc]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FULL MATRIX (every cat × every city) ===== */}
        <section className="section-pad" style={{ background: 'var(--bg-2)' }}>
          <div className="container">
            <h2 className="rent-h2">{copy.matrixHeading}</h2>
            <p className="rent-lead rent-lead-narrow">{copy.matrixLead}</p>

            <div className="rent-matrix">
              {liveCategories.map((c) => {
                const tr = pickTr(c.translations, lang);
                return (
                  <div key={c.slug} className="rent-matrix-row">
                    <div className="rent-matrix-cat">
                      <h3>{tr?.name ?? c.slug}</h3>
                    </div>
                    <div className="rent-matrix-cities">
                      {CITIES.map((city) => (
                        <a
                          key={city.slug}
                          href={`/${loc}/rent/${c.slug}/${city.slug}`}
                          className="rent-matrix-link"
                        >
                          {city.name[loc]}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </>
  );
}
