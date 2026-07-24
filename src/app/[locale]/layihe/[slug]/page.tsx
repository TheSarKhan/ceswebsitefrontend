import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbSchema, organizationSchema } from '@/lib/schema';
import { alternatesFor, localeUrl, ogLocale, SITE_URL, type Locale } from '@/lib/seo';
import { serverFetch } from '@/lib/api';
import { pickTr, type ProjectDto } from '@/lib/types';
import { TexnikaGallery } from '@/components/TexnikaGallery';
import { TexnikaOrderActions } from '@/components/TexnikaOrderActions';

export const revalidate = 600;
export const dynamicParams = true;

type Params = { locale: string; slug: string };
const LOCALE_LANG = { az: 'AZ', ru: 'RU', en: 'EN' } as const;

const LABELS = {
  az: { home: 'Ana səhifə', projects: 'Layihələr', other: 'Digər layihələr' },
  ru: { home: 'Главная', projects: 'Проекты', other: 'Другие проекты' },
  en: { home: 'Home', projects: 'Projects', other: 'Other projects' },
} as const;

export async function generateStaticParams(): Promise<Params[]> {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return { title: 'Not found' };
  const project = await serverFetch<ProjectDto>(`/api/v1/public/projects/${slug}`);
  if (!project) return { title: 'Not found' };

  const loc = locale as Locale;
  const tr = pickTr(project.translations, LOCALE_LANG[loc]);
  const title = `${tr?.title ?? project.slug}${project.year ? ` (${project.year})` : ''} | CES`;
  const description =
    (tr?.description?.replace(/\s+/g, ' ').trim().slice(0, 160)) ||
    tr?.meta ||
    `${tr?.title ?? project.slug} — CES layihəsi.`;
  const url = localeUrl(loc, `/layihe/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url, languages: alternatesFor(`/layihe/${slug}`) },
    openGraph: {
      title,
      description,
      url,
      siteName: 'CES — Construction Equipment Services',
      locale: ogLocale(loc),
      type: 'article',
      images: project.image ? [{ url: project.image }] : [{ url: '/icon.png', width: 512, height: 512 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [project.image ?? '/icon.png'] },
  };
}

export default async function LayihePage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const project = await serverFetch<ProjectDto>(`/api/v1/public/projects/${slug}`);
  if (!project) notFound();

  const loc = locale as Locale;
  const lang = LOCALE_LANG[loc];
  const t = LABELS[loc];
  const tr = pickTr(project.translations, lang);
  const title = tr?.title ?? project.slug;

  const images = [project.image, ...(project.gallery ?? [])].filter((s): s is string => !!s);
  const paragraphs = (tr?.description ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  // Other projects
  const all = (await serverFetch<ProjectDto[]>('/api/v1/public/projects')) ?? [];
  const others = all.filter((p) => p.slug !== project.slug).slice(0, 4);

  const crumbs = [
    { name: t.home, url: localeUrl(loc, '') },
    { name: t.projects, url: localeUrl(loc, '/#projects') },
    { name: title, url: localeUrl(loc, `/layihe/${slug}`) },
  ];

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: title,
    description: tr?.description ?? tr?.meta ?? undefined,
    ...(project.image && { image: [project.image, ...(project.gallery ?? [])] }),
    ...(project.year && { dateCreated: project.year }),
    ...(tr?.category && { genre: tr.category }),
    author: { '@id': `${SITE_URL}#organization` },
    provider: { '@id': `${SITE_URL}#organization` },
  };

  return (
    <>
      <SiteHeader />
      <main className="tx-page">
        <div className="container">
          <nav className="tx-crumbs" aria-label="breadcrumb">
            <Link href={`/${loc}`}>{t.home}</Link>
            <span className="tx-crumbs-sep">/</span>
            <Link href={`/${loc}#projects`}>{t.projects}</Link>
            <span className="tx-crumbs-sep">/</span>
            <span className="tx-crumbs-current">{title}</span>
          </nav>

          <div className="tx-hero">
            <TexnikaGallery images={images} alt={title} />

            <div className="tx-hero-info">
              {(project.year || tr?.category) && (
                <div className="tx-eyebrow">
                  {[tr?.category, project.year].filter(Boolean).join(' · ')}
                </div>
              )}
              <h1 className="tx-title">{title}</h1>
              {paragraphs.length > 0 ? (
                <div className="tx-desc-scroll">
                  {paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : (
                tr?.meta && <p className="tx-lead">{tr.meta}</p>
              )}
              <TexnikaOrderActions equipmentName={title} lang={lang} mode="project" />
            </div>
          </div>

          {others.length > 0 && (
            <section className="tx-section tx-print-hide">
              <h2>{t.other}</h2>
              <div className="tx-similar">
                {others.map((p) => {
                  const pTr = pickTr(p.translations, lang);
                  return (
                    <Link key={p.slug} href={`/${loc}/layihe/${p.slug}`} className="tx-similar-card">
                      <div className="tx-similar-img">
                        {p.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image} alt={pTr?.title ?? p.slug} />
                        )}
                      </div>
                      <div className="tx-similar-body">
                        <div className="tx-similar-name">{pTr?.title ?? p.slug}</div>
                        {(pTr?.category || p.year) && (
                          <div className="tx-similar-price">
                            {[pTr?.category, p.year].filter(Boolean).join(' · ')}
                          </div>
                        )}
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

      <JsonLd data={[projectSchema, breadcrumbSchema(crumbs), organizationSchema(loc)]} />
    </>
  );
}
