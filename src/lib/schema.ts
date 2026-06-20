/**
 * JSON-LD schema builders. Keep all schema generation here so we have one
 * source of truth for SEO structured data — change a phone number once and
 * every rich-result snippet on the site is updated.
 *
 * Schemas used:
 *  - Organization / LocalBusiness — the company itself (NAP, hours, area served)
 *  - WebSite — sitelinks search box potential
 *  - ItemList of Product — fleet catalogue
 *  - FAQPage — questions section
 *  - BreadcrumbList — navigation
 */

import { SITE_URL, localeUrl, type Locale } from './seo';
import { pickTr } from './types';
import type {
  FleetCategoryDto,
  FleetItemCard,
  FaqDto,
  OfferingDto,
} from './types';
import type { Lang } from './translations';

// --- Static company facts. Update here when business details change. -------
const COMPANY = {
  name: 'CES — Construction Equipment Services',
  legalName: 'CES',
  phone: '+994506829080',
  email: 'sales@ces.com.az',
  addressCountry: 'AZ',
  addressLocality: 'Bakı',
  region: 'Bakı',
  // Fill in when a precise street address is decided. Without one we still
  // emit a valid LocalBusiness with city-level address.
  streetAddress: undefined as string | undefined,
  postalCode: undefined as string | undefined,
  geo: undefined as { latitude: number; longitude: number } | undefined,
  foundingDate: '2020',
  areaServed: ['Bakı', 'Sumqayıt', 'Azərbaycan'],
  languages: ['Azerbaijani', 'Russian', 'English'],
  openingHours: 'Mo-Sa 09:00-18:00', // confirm real working hours
  socialProfiles: [] as string[], // Add Instagram/Facebook/LinkedIn URLs here
};

type JsonLdNode = Record<string, unknown>;

const LANG_FROM_LOCALE: Record<Locale, Lang> = {
  az: 'AZ',
  ru: 'RU',
  en: 'EN',
};

// ---------- Organization / LocalBusiness ----------
export function organizationSchema(locale: Locale): JsonLdNode {
  const url = localeUrl(locale);
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_URL}#organization`,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url,
    logo: `${SITE_URL}/icon.png`,
    image: `${SITE_URL}/icon.png`,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    foundingDate: COMPANY.foundingDate,
    address: {
      '@type': 'PostalAddress',
      addressCountry: COMPANY.addressCountry,
      addressLocality: COMPANY.addressLocality,
      addressRegion: COMPANY.region,
      ...(COMPANY.streetAddress && { streetAddress: COMPANY.streetAddress }),
      ...(COMPANY.postalCode && { postalCode: COMPANY.postalCode }),
    },
    ...(COMPANY.geo && {
      geo: { '@type': 'GeoCoordinates', ...COMPANY.geo },
    }),
    areaServed: COMPANY.areaServed.map((area) => ({
      '@type': 'AdministrativeArea',
      name: area,
    })),
    availableLanguage: COMPANY.languages,
    openingHours: COMPANY.openingHours,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: COMPANY.phone,
      email: COMPANY.email,
      contactType: 'sales',
      availableLanguage: COMPANY.languages,
      areaServed: COMPANY.addressCountry,
    },
  };
  if (COMPANY.socialProfiles.length > 0) {
    node.sameAs = COMPANY.socialProfiles;
  }
  return node;
}

// ---------- WebSite ----------
export function websiteSchema(locale: Locale): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: localeUrl(locale),
    name: COMPANY.name,
    inLanguage: locale,
    publisher: { '@id': `${SITE_URL}#organization` },
  };
}

// ---------- Fleet catalogue as ItemList of Product ----------
export function fleetItemListSchema(
  categories: FleetCategoryDto[] | null | undefined,
  locale: Locale,
): JsonLdNode | null {
  if (!categories || categories.length === 0) return null;
  const lang = LANG_FROM_LOCALE[locale];

  // Flatten subcategory briefs into a list. We don't have full items in the
  // server-fetched categories payload (briefs only), so each entry is a
  // category-level pointer with the item count — Google still picks this up
  // as a structured catalogue, and per-item Product schema can be added when
  // dedicated /fleet/[slug] pages ship.
  const elements: JsonLdNode[] = [];
  let position = 1;
  for (const c of categories) {
    const tr = pickTr(c.translations, lang);
    for (const s of c.subcategories) {
      if ((s.itemCount ?? 0) === 0) continue;
      const subTr = pickTr(s.translations, lang);
      elements.push({
        '@type': 'ListItem',
        position: position++,
        item: {
          '@type': 'Product',
          name: `${tr?.name ?? c.slug} — ${subTr?.name ?? s.slug}`,
          category: tr?.name ?? c.slug,
          url: `${localeUrl(locale)}#fleet-${c.slug}`,
          brand: { '@type': 'Brand', name: COMPANY.legalName },
          offers: {
            '@type': 'AggregateOffer',
            offerCount: s.itemCount,
            priceCurrency: 'AZN',
            availability: 'https://schema.org/InStock',
            seller: { '@id': `${SITE_URL}#organization` },
          },
        },
      });
    }
  }
  if (elements.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CES — Texnika kataloqu',
    numberOfItems: elements.length,
    itemListElement: elements,
  };
}

/**
 * Per-fleet-item Product schema. Use when rendering a detail page for a
 * single piece of equipment ({@code /[locale]/fleet/[slug]}).
 */
export function productSchema(
  item: FleetItemCard & { description?: string | null },
  parent: { categoryName: string; subcategoryName: string },
  locale: Locale,
): JsonLdNode {
  const lang = LANG_FROM_LOCALE[locale];
  const tr = pickTr(item.translations, lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: tr?.name ?? item.slug,
    description: tr?.description ?? undefined,
    sku: item.modelNumber ?? item.slug,
    image: item.image ? [item.image] : undefined,
    category: `${parent.categoryName} > ${parent.subcategoryName}`,
    brand: { '@type': 'Brand', name: COMPANY.legalName },
    offers: item.price
      ? {
          '@type': 'Offer',
          price: item.price.replace(/[^\d.]/g, '') || undefined,
          priceCurrency: 'AZN',
          availability: 'https://schema.org/InStock',
          seller: { '@id': `${SITE_URL}#organization` },
          ...(item.priceUnit && {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: item.price.replace(/[^\d.]/g, '') || undefined,
              priceCurrency: 'AZN',
              unitText: item.priceUnit,
            },
          }),
        }
      : undefined,
  };
}

// ---------- FAQ Page ----------
export function faqSchema(
  faqs: FaqDto[] | null | undefined,
  locale: Locale,
): JsonLdNode | null {
  if (!faqs || faqs.length === 0) return null;
  const lang = LANG_FROM_LOCALE[locale];
  const mainEntity = faqs
    .map((f) => {
      const tr = pickTr(f.translations, lang);
      if (!tr?.question || !tr?.answer) return null;
      return {
        '@type': 'Question',
        name: tr.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: tr.answer,
        },
      };
    })
    .filter(Boolean);
  if (mainEntity.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

// ---------- Services list ----------
export function servicesSchema(
  offerings: OfferingDto[] | null | undefined,
  locale: Locale,
): JsonLdNode | null {
  if (!offerings || offerings.length === 0) return null;
  const lang = LANG_FROM_LOCALE[locale];
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CES — Xidmətlər',
    itemListElement: offerings.map((o, i) => {
      const tr = pickTr(o.translations, lang);
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Service',
          name: tr?.title ?? o.slug,
          description: tr?.description ?? undefined,
          provider: { '@id': `${SITE_URL}#organization` },
          areaServed: COMPANY.areaServed,
        },
      };
    }),
  };
}

// ---------- BreadcrumbList ----------
export function breadcrumbSchema(
  crumbs: { name: string; url: string }[],
): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}
