'use client';

import { Placeholder } from './Hero';
import { useLang } from '@/lib/lang';
import { useProjects } from '@/lib/hooks';
import { pickTr } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function Projects() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useProjects();
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
          <div className="meta">
            2024 — 2026
            <br />
            {t.projects_meta}
          </div>
        </Reveal>

        <StaggerGroup className="projects-grid" stagger={0.07}>
          {projects.map((p) => {
            const tr = pickTr(p.translations, lang);
            return (
              <StaggerItem key={p.slug} className="project">
                <div className="img-fill">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={tr?.title ?? ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                    />
                  ) : (
                    <Placeholder label={tr?.category?.toUpperCase() ?? ''} />
                  )}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--gold)',
                    letterSpacing: '0.2em',
                    zIndex: 2,
                  }}
                >
                  {p.slug}
                </div>
                <div className="project-overlay">
                  <div className="cat">{tr?.category}</div>
                  <h4>{tr?.title}</h4>
                  <div className="meta">{tr?.meta}</div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
