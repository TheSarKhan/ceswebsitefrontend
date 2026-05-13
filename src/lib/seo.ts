import { routing } from '@/i18n/routing';

/**
 * Public-facing site origin used for canonicals, sitemap, robots, and
 * OpenGraph URLs. Set {@code NEXT_PUBLIC_SITE_URL} in production (e.g.
 * {@code https://ces.az}); falls back to localhost for dev so links remain
 * valid while testing.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ?? 'http://localhost:3000'
);

export type Locale = (typeof routing.locales)[number];

/** Absolute URL for {@code path} under the given locale. {@code path} should start with /. */
export function localeUrl(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  return `${SITE_URL}/${locale}${clean ? '/' + clean : ''}`;
}

/**
 * Hreflang map for a given path across every locale, including the
 * {@code x-default} pointing at the default locale.
 */
export function alternatesFor(path = ''): Record<string, string> {
  const map: Record<string, string> = {};
  for (const lang of routing.locales) {
    map[lang] = localeUrl(lang, path);
  }
  map['x-default'] = localeUrl(routing.defaultLocale, path);
  return map;
}

/** Maps a next-intl locale code to its OpenGraph locale string. */
export function ogLocale(locale: Locale): string {
  switch (locale) {
    case 'az': return 'az_AZ';
    case 'ru': return 'ru_RU';
    case 'en': return 'en_US';
    default:   return 'az_AZ';
  }
}
