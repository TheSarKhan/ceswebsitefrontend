import type { MetadataRoute } from 'next';
import { apiBaseUrl } from '@/lib/api';
import { alternatesFor, localeUrl } from '@/lib/seo';
import { routing } from '@/i18n/routing';
import { CITIES } from '@/lib/cities';
import type { FleetCategoryDto, ProjectDto } from '@/lib/types';

/**
 * Dynamic sitemap. Currently the public catalogue lives on the homepage as
 * anchored sections — categories aren't standalone routes — so we list the
 * three locale homepages plus a per-category anchor (helps Google understand
 * the in-page structure). When dedicated /fleet/[slug] / /projects/[slug]
 * routes ship, extend this file with their entries.
 *
 * Falls back gracefully if the backend is unreachable at build time — the
 * sitemap still includes the homepage entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Homepage per locale (with hreflang alternates).
  for (const lang of routing.locales) {
    entries.push({
      url: localeUrl(lang),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: lang === routing.defaultLocale ? 1.0 : 0.9,
      alternates: { languages: alternatesFor() },
    });
  }

  // Pull dynamic content from the backend so new categories / projects show
  // up automatically. Soft-fail on errors so sitemap generation never breaks.
  const categories = await safeFetch<FleetCategoryDto[]>('/api/v1/public/fleet/categories');
  const projects = await safeFetch<ProjectDto[]>('/api/v1/public/projects');

  // /rent hub per locale.
  for (const lang of routing.locales) {
    entries.push({
      url: localeUrl(lang, '/rent'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: alternatesFor('/rent') },
    });
  }

  // Programmatic-SEO matrix: category × city × locale. Only include
  // categories that have published items so we don't expose dead pages.
  const liveCategories = (categories ?? []).filter((c) =>
    c.subcategories.some((s) => (s.itemCount ?? 0) > 0),
  );
  for (const cat of liveCategories) {
    for (const city of CITIES) {
      for (const lang of routing.locales) {
        const path = `/rent/${cat.slug}/${city.slug}`;
        entries.push({
          url: localeUrl(lang, path),
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.7,
          alternates: { languages: alternatesFor(path) },
        });
      }
    }
  }

  // Same for projects — anchored under the projects section.
  for (const project of projects ?? []) {
    for (const lang of routing.locales) {
      entries.push({
        url: `${localeUrl(lang)}#project-${project.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBaseUrl}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
