import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { productSchema, breadcrumbSchema, organizationSchema } from '@/lib/schema';
import { alternatesFor, localeUrl, ogLocale, type Locale } from '@/lib/seo';
import { serverFetch } from '@/lib/api';
import { pickTr, type FleetItemDto, type FleetSubcategoryDto } from '@/lib/types';
import { TexnikaGallery } from '@/components/TexnikaGallery';
import { TexnikaOrderActions } from '@/components/TexnikaOrderActions';

export const revalidate = 600;
export const dynamicParams = true;

type Params = { locale: string; slug: string };

const LOCALE_LANG = { az: 'AZ', ru: 'RU', en: 'EN' } as const;

const LABELS = {
  az: { home: 'Ana səhifə', specs: 'Parametrlər', desc: 'Ətraflı', similar: 'Bənzər texnikalar', from: 'qiymət', all: 'Bütün texnika' },
  ru: { home: 'Главная', specs: 'Характеристики', desc: 'Описание', similar: 'Похожая техника', from: 'цена', all: 'Вся техника' },
  en: { home: 'Home', specs: 'Specifications', desc: 'Overview', similar: 'Similar equipment', from: 'price', all: 'All equipment' },
} as const;

export async function generateStaticParams(): Promise<Params[]> {
  // Generated on demand (ISR); the fleet grows via admin so we don't pin slugs.
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: 'Not found' };
  const item = await serverFetch<FleetItemDto>(`/api/v1/public/fleet/items/${slug}`);
  if (!item) return { title: 'Not found' };

  const loc = locale as Locale;
  const lang = LOCALE_LANG[loc];
  const tr = pickTr(item.translations, lang);
  const name = tr?.name ?? item.slug;
  const title = `${name}${item.modelNumber ? ` — ${item.modelNumber}` : ''} | CES`;
  const description =
    (tr?.description?.replace(/\s+/g, ' ').trim().slice(0, 160)) ||
    `${name} — CES-də icarə. Peşəkar texnika parkı.`;
  const url = localeUrl(loc, `/texnika/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url, languages: alternatesFor(`/texnika/${slug}`) },
    openGraph: {
      title,
      description,
      url,
      siteName: 'CES — Construction Equipment Services',
      locale: ogLocale(loc),
      type: 'website',
      images: item.image ? [{ url: item.image }] : [{ url: '/icon.png', width: 512, height: 512 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [item.image ?? '/icon.png'] },
  };
}

export default async function TexnikaPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const item = await serverFetch<FleetItemDto>(`/api/v1/public/fleet/items/${slug}`);
  if (!item) notFound();

  const loc = locale as Locale;
  const lang = LOCALE_LANG[loc];
  const t = LABELS[loc];
  const tr = pickTr(item.translations, lang);
  const catTr = pickTr(item.category.translations, lang);
  const subTr = pickTr(item.subcategory.translations, lang);
  const name = tr?.name ?? item.slug;
  const orderName = `${name}${item.modelNumber ? ` ${item.modelNumber}` : ''}`;

  // Similar equipment = other items in the same subcategory.
  const sub = await serverFetch<FleetSubcategoryDto>(
    `/api/v1/public/fleet/subcategories/${item.subcategory.slug}`,
  );
  const similar = (sub?.items ?? []).filter((i) => i.slug !== item.slug).slice(0, 4);

  const paragraphs = (tr?.description ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const crumbs = [
    { name: t.home, url: localeUrl(loc, '') },
    { name: catTr?.name ?? item.category.slug, url: localeUrl(loc, '/#fleet') },
    { name, url: localeUrl(loc, `/texnika/${slug}`) },
  ];

  return (
    <>
      <SiteHeader />
      <main className="tx-page">
        <div className="container">
          <nav className="tx-crumbs" aria-label="breadcrumb">
            <Link href={`/${loc}`}>{t.home}</Link>
            <span className="tx-crumbs-sep">/</span>
            <Link href={`/${loc}#fleet`}>{catTr?.name ?? item.category.slug}</Link>
            <span className="tx-crumbs-sep">/</span>
            <span className="tx-crumbs-current">{name}</span>
          </nav>

          <div className="tx-hero">
            <TexnikaGallery images={item.image ? [item.image] : []} alt={name} />

            <div className="tx-hero-info">
              {tr?.badge && <span className="tx-badge">{tr.badge}</span>}
              <h1 className="tx-title">{name}</h1>
              {item.price && (
                <div className="tx-price">
                  {item.price}
                  {item.priceUnit && <span className="tx-price-unit"> /{item.priceUnit}</span>}
                </div>
              )}
              {paragraphs.length > 0 && (
                <div className="tx-desc-scroll">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              <TexnikaOrderActions equipmentName={orderName} lang={lang} />
            </div>
          </div>

          {item.specs.length > 0 && (
            <section className="tx-section tx-specs-section">
              <h2>{t.specs}</h2>
              <table className="tx-specs">
                <tbody>
                  {item.specs.map((s, i) => (
                    <tr key={i}>
                      <th>{pickTr(s.key, lang)}</th>
                      <td>{pickTr(s.value, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {similar.length > 0 && (
            <section className="tx-section tx-print-hide">
              <h2>{t.similar}</h2>
              <div className="tx-similar">
                {similar.map((it) => {
                  const itTr = pickTr(it.translations, lang);
                  return (
                    <Link key={it.slug} href={`/${loc}/texnika/${it.slug}`} className="tx-similar-card">
                      <div className="tx-similar-img">
                        {it.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image} alt={itTr?.name ?? it.slug} />
                        )}
                      </div>
                      <div className="tx-similar-body">
                        <div className="tx-similar-name">{itTr?.name ?? it.slug}</div>
                        {it.price && <div className="tx-similar-price">{it.price}</div>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />

      <JsonLd
        data={[
          productSchema(
            item,
            {
              categoryName: catTr?.name ?? item.category.slug,
              subcategoryName: subTr?.name ?? item.subcategory.slug,
            },
            loc,
          ),
          breadcrumbSchema(crumbs),
          organizationSchema(loc),
        ]}
      />
    </>
  );
}
