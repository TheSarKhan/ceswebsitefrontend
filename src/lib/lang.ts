'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Lang } from './translations';

export function useLang() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const lang = locale.toUpperCase() as Lang;

  const setLang = useCallback(
    (next: Lang) => {
      const newLocale = next.toLowerCase();
      const newPath = pathname.replace(/^\/[^/]+/, `/${newLocale}`);
      router.push(newPath);
    },
    [pathname, router],
  );

  return { lang, setLang };
}
