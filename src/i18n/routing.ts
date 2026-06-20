import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['az', 'ru', 'en'],
  defaultLocale: 'az',
  localePrefix: 'always',
  // Don't auto-pick the locale from the browser's Accept-Language header — first
  // visit always opens in Azerbaijani. A visitor's manual language choice is
  // still remembered via the locale cookie.
  localeDetection: false,
});
