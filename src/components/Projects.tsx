'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Placeholder } from './Hero';
import { useLang } from '@/lib/lang';
import { useProjects } from '@/lib/hooks';
import { pickTr } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function Projects({
  initialProjects,
}: {
  initialProjects?: import('@/lib/types').ProjectDto[];
} = {}) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useProjects(initialProjects);
  const projects = isError ? [] : (data ?? []);

  return (
    <section id="projects" className="section-pad" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <Reveal className="section-head">
          <h2>
            {t.projects_h}
            <br />
            <span className="stroke">{t.projects_h_stroke}</span>
          </h2>
        </Reveal>

        <StaggerGroup className="projects-grid" stagger={0.07}>
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

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <Link href={`/${lang.toLowerCase()}/layiheler`} className="btn btn-ghost btn-arrow">
            {t.projects_btn}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
