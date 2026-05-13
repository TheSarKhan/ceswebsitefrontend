import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { TopBar, Nav } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Contact } from '@/components/Contact';
import { JsonLd } from '@/components/JsonLd';
import {
  organizationSchema,
  breadcrumbSchema,
  faqSchema,
} from '@/lib/schema';
import { alternatesFor, localeUrl, ogLocale, SITE_URL, type Locale } from '@/lib/seo';
import { serverFetch } from '@/lib/api';
import { CITIES, findCity } from '@/lib/cities';
import { buildRentalCopy } from '@/lib/rental-copy';
import { pickTr } from '@/lib/types';
import type {
  FleetCategoryDto,
  FleetSubcategoryDto,
} from '@/lib/types';

export const revalidate = 600;
export const dynamicParams = true; // generate on-demand for new categories

type Params = { locale: string; category: string; city: string };

const LOCALE_LANG = { az: 'AZ', ru: 'RU', en: 'EN' } as const;

// ---------- generateStaticParams ----------
// Pre-build the most popular combinations at build time so the first crawl
// returns instantly. New combinations (e.g. a category just added in admin)
// fall through to ISR on first request.
export async function generateStaticParams(): Promise<Params[]> {
  const categories =
    (await serverFetch<FleetCategoryDto[]>(
      '/api/v1/public/fleet/categories',
    )) ?? [];
  const live = categories.filter((c) =>
    c.subcategories.some((s) => (s.itemCount ?? 0) > 0),
  );
  const result: Params[] = [];
  for (const c of live) {
    for (const city of CITIES) {
      for (const locale of routing.locales) {
        result.push({ locale, category: c.slug, city: city.slug });
      }
    }
  }
  return result;
}

// ---------- generateMetadata ----------
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, category: categorySlug, city: citySlug } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: 'Not found' };

  const [categories, city] = await Promise.all([
    serverFetch<FleetCategoryDto[]>('/api/v1/public/fleet/categories'),
    Promise.resolve(findCity(citySlug)),
  ]);
  const category = (categories ?? []).find((c) => c.slug === categorySlug);
  if (!category || !city) return { title: 'Not found' };

  const loc = locale as Locale;
  const copy = buildRentalCopy(category, city, loc);
  const url = localeUrl(loc, `/rent/${categorySlug}/${citySlug}`);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: alternatesFor(`/rent/${categorySlug}/${citySlug}`),
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: 'CES — Construction Equipment Services',
      locale: ogLocale(loc),
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

// ---------- Page ----------
export default async function RentalPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, category: categorySlug, city: citySlug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const city = findCity(citySlug);
  if (!city) notFound();

  const categories =
    (await serverFetch<FleetCategoryDto[]>(
      '/api/v1/public/fleet/categories',
    )) ?? [];
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  // Pull one subcategory detail to surface real items as cards (proves to
  // both crawlers and visitors that this isn't an empty doorway page).
  const firstSubWithItems = category.subcategories.find(
    (s) => (s.itemCount ?? 0) > 0,
  );
  const subDetail = firstSubWithItems
    ? await serverFetch<FleetSubcategoryDto>(
        `/api/v1/public/fleet/subcategories/${firstSubWithItems.slug}`,
      )
    : null;

  const loc = locale as Locale;
  const lang = LOCALE_LANG[loc];
  const copy = buildRentalCopy(category, city, loc);
  const catName = pickTr(category.translations, lang)?.name ?? category.slug;

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(loc),
          breadcrumbSchema([
            { name: copy.breadcrumbHome, url: localeUrl(loc) },
            { name: copy.breadcrumbRent, url: localeUrl(loc, '/rent') },
            {
              name: `${catName} — ${city.name[loc]}`,
              url: localeUrl(loc, `/rent/${category.slug}/${city.slug}`),
            },
          ]),
          // FAQPage rich result — Google often shows these inline in SERPs
          // for long-tail "service in city" queries.
          faqSchema(
            copy.faq.map((f, i) => ({
              id: i,
              sortOrder: i,
              translations: {
                [loc]: { question: f.q, answer: f.a },
              },
            })),
            loc,
          ),
        ]}
      />

      <TopBar />
      <Nav />

      <main className="rent-page">
        {/* ===== HERO ===== */}
        <section className="section-pad rent-hero">
          <div className="container">
            <div className="eyebrow">
              <a href={`/${loc}/rent`} style={{ color: 'var(--fg-3)' }}>
                ▸ {copy.breadcrumbRent}
              </a>
              {' / '}
              {catName} / {city.name[loc]}
            </div>
            <h1 className="rent-h1">{copy.h1}</h1>
            {copy.intro.map((p, i) => (
              <p key={i} className="rent-lead">
                {p}
              </p>
            ))}
          </div>
        </section>

        {/* ===== INDUSTRY CONTEXT ===== */}
        <section className="section-pad" style={{ background: 'var(--bg-2)' }}>
          <div className="container rent-2col">
            <div>
              <div className="eyebrow">▸ {city.name[loc]}</div>
              <h2 className="rent-h2">{copy.industryHeading}</h2>
            </div>
            <p className="rent-prose">{city.industry[loc]}</p>
          </div>
        </section>

        {/* ===== AVAILABLE EQUIPMENT (real items) ===== */}
        {subDetail && subDetail.items.length > 0 && (
          <section className="section-pad">
            <div className="container">
              <div className="eyebrow">▸ {catName}</div>
              <h2 className="rent-h2">
                {pickTr(subDetail.translations, lang)?.name ?? subDetail.slug}
              </h2>
              <div className="rent-equipment-grid">
                {subDetail.items.slice(0, 6).map((it) => {
                  const itTr = pickTr(it.translations, lang);
                  return (
                    <article key={it.slug} className="rent-item">
                      {it.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image}
                          alt={itTr?.name ?? it.slug}
                          className="rent-item-img"
                        />
                      )}
                      <div className="rent-item-body">
                        {it.modelNumber && (
                          <div className="rent-item-model">{it.modelNumber}</div>
                        )}
                        <h3>{itTr?.name ?? it.slug}</h3>
                        {it.price && (
                          <div className="rent-item-price">
                            {it.price}
                            {it.priceUnit && (
                              <span style={{ color: 'var(--fg-3)', fontSize: 11 }}>
                                {' '}/{it.priceUnit}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===== DELIVERY ===== */}
        <section className="section-pad" style={{ background: 'var(--bg-2)' }}>
          <div className="container rent-2col">
            <div>
              <div className="eyebrow">▸ {city.distanceKm} km</div>
              <h2 className="rent-h2">{copy.deliveryHeading}</h2>
            </div>
            <p className="rent-prose">{copy.deliveryBody}</p>
          </div>
        </section>

        {/* ===== PRICING ===== */}
        <section className="section-pad">
          <div className="container rent-2col">
            <div>
              <h2 className="rent-h2">{copy.pricingHeading}</h2>
            </div>
            <p className="rent-prose">{copy.pricingBody}</p>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="section-pad" style={{ background: 'var(--bg-2)' }}>
          <div className="container">
            <h2 className="rent-h2">FAQ — {catName} / {city.name[loc]}</h2>
            <div className="rent-faq">
              {copy.faq.map((f, i) => (
                <details key={i} className="rent-faq-item">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ===== RELATED LINKS ===== */}
        <section className="section-pad">
          <div className="container rent-related">
            <div>
              <h3 className="rent-related-h">{copy.relatedCityHeading}</h3>
              <ul className="rent-related-list">
                {CITIES.filter((c) => c.slug !== city.slug).map((other) => (
                  <li key={other.slug}>
                    <a href={`/${loc}/rent/${category.slug}/${other.slug}`}>
                      {catName} — {other.name[loc]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="rent-related-h">{copy.relatedCategoryHeading}</h3>
              <ul className="rent-related-list">
                {categories
                  .filter(
                    (c) =>
                      c.slug !== category.slug &&
                      c.subcategories.some((s) => (s.itemCount ?? 0) > 0),
                  )
                  .map((other) => {
                    const otherName =
                      pickTr(other.translations, lang)?.name ?? other.slug;
                    return (
                      <li key={other.slug}>
                        <a href={`/${loc}/rent/${other.slug}/${city.slug}`}>
                          {otherName} — {city.name[loc]}
                        </a>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </section>

        {/* ===== CTA → Contact ===== */}
        <section className="section-pad rent-cta" style={{ background: 'var(--bg-2)' }}>
          <div className="container">
            <h2 className="rent-h2">{copy.ctaHeading}</h2>
            <p className="rent-lead rent-lead-narrow">{copy.ctaBody}</p>
            <a href={`/${loc}#contact`} className="btn btn-primary btn-arrow" style={{ marginTop: 22 }}>
              {copy.ctaButton} →
            </a>
          </div>
        </section>

        <Contact />
      </main>

      <Footer />
    </>
  );
}
