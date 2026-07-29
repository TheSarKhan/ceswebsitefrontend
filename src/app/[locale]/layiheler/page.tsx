import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { SiteHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Contact } from '@/components/Contact';
import { ProjectsFull } from '@/components/ProjectsFull';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema, breadcrumbSchema } from '@/lib/schema';
import { alternatesFor, localeUrl, type Locale } from '@/lib/seo';
import { serverFetch } from '@/lib/api';
import type { ProjectDto } from '@/lib/types';

export const revalidate = 600;

const META: Record<Locale, { title: string; description: string; crumb: string; home: string }> = {
  az: {
    title: 'Layihələrimiz — icra edilmiş layihələr | CES',
    description:
      'CES-in icra etdiyi kompleks layihələr — Formula 1, COP29, Sea Breeze, Port Baku və daha çoxu. Beynəlxalq tədbirlərdən iri tikinti obyektlərinə qədər.',
    crumb: 'Layihələr',
    home: 'Ana səhifə',
  },
  ru: {
    title: 'Наши проекты — реализованные проекты | CES',
    description:
      'Комплексные проекты, реализованные CES — Formula 1, COP29, Sea Breeze, Port Baku и другие. От международных мероприятий до крупных строительных объектов.',
    crumb: 'Проекты',
    home: 'Главная',
  },
  en: {
    title: 'Our Projects — delivered projects | CES',
    description:
      'Complex projects delivered by CES — Formula 1, COP29, Sea Breeze, Port Baku and more. From international events to major construction sites.',
    crumb: 'Projects',
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
    alternates: { canonical: localeUrl(loc, '/layiheler'), languages: alternatesFor('/layiheler') },
    openGraph: {
      title: m.title,
      description: m.description,
      url: localeUrl(loc, '/layiheler'),
    },
  };
}

export default async function LayihelerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const loc = locale as Locale;
  const projects = await serverFetch<ProjectDto[]>('/api/v1/public/projects');

  return (
    <>
      <JsonLd
        data={[
          organizationSchema(loc),
          breadcrumbSchema([
            { name: META[loc].home, url: localeUrl(loc) },
            { name: META[loc].crumb, url: localeUrl(loc, '/layiheler') },
          ]),
        ]}
      />

      <SiteHeader />
      <main>
        <ProjectsFull initialProjects={projects ?? undefined} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
