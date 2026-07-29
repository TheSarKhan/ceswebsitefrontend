'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Placeholder } from './Hero';
import { useLang } from '@/lib/lang';
import { useProjects } from '@/lib/hooks';
import { pickTr, type ProjectDto } from '@/lib/types';
import { type Lang } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

const T: Record<Lang, { title: string; lead: string; empty: string; home: string; crumb: string }> = {
  AZ: {
    title: 'Layihələrimiz',
    lead: 'İcra etdiyimiz kompleks layihələr — beynəlxalq tədbirlərdən iri tikinti obyektlərinə qədər. Detallar üçün layihəyə klikləyin.',
    empty: 'Hələ layihə əlavə olunmayıb.',
    home: 'Ana səhifə',
    crumb: 'Layihələr',
  },
  RU: {
    title: 'Наши проекты',
    lead: 'Реализованные нами комплексные проекты — от международных мероприятий до крупных строительных объектов. Нажмите на проект для подробностей.',
    empty: 'Проекты пока не добавлены.',
    home: 'Главная',
    crumb: 'Проекты',
  },
  EN: {
    title: 'Our Projects',
    lead: 'The complex projects we have delivered — from international events to major construction sites. Click a project for details.',
    empty: 'No projects added yet.',
    home: 'Home',
    crumb: 'Projects',
  },
};

export function ProjectsFull({ initialProjects }: { initialProjects?: ProjectDto[] }) {
  const { lang } = useLang();
  const t = T[lang];
  const { data, isError } = useProjects(initialProjects);
  const projects = isError ? [] : (data ?? []);

  return (
    <section className="catalog">
      <div className="container">
        <nav className="tx-crumbs catalog-crumbs" aria-label="breadcrumb">
          <Link href={`/${lang.toLowerCase()}`}>{t.home}</Link>
          <span className="tx-crumbs-sep">/</span>
          <span className="tx-crumbs-current">{t.crumb}</span>
        </nav>

        <Reveal className="catalog-head">
          <h1>{t.title}</h1>
          <p>{t.lead}</p>
        </Reveal>

        {projects.length === 0 ? (
          <div className="fleet-empty">{t.empty}</div>
        ) : (
          <StaggerGroup className="projects-grid" stagger={0.06}>
            {projects.map((p) => {
              const tr = pickTr(p.translations, lang);
              const href = `/${lang.toLowerCase()}/layihe/${p.slug}`;
              return (
                <StaggerItem key={p.slug} className="project">
                  <Link href={href} className="project-link" aria-label={tr?.title ?? p.slug}>
                    <div className="img-fill">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={tr?.title ?? p.slug}
                          fill
                          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <Placeholder label={tr?.category?.toUpperCase() ?? ''} />
                      )}
                    </div>
                    <div className="project-overlay">
                      <div className="cat">{tr?.category}</div>
                      <h4>{tr?.title}</h4>
                      <div className="meta">{tr?.meta}</div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        )}
      </div>
    </section>
  );
}
