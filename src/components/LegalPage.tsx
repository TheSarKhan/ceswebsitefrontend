import Link from 'next/link';
import { SiteHeader } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { LegalDoc } from '@/lib/legal-content';

const HOME_LABEL = { az: 'Ana səhifə', ru: 'Главная', en: 'Home' } as const;

export function LegalPage({ doc, locale }: { doc: LegalDoc; locale: 'az' | 'ru' | 'en' }) {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <div className="container legal-container">
          <nav className="legal-crumbs" aria-label="breadcrumb">
            <Link href={`/${locale}`}>{HOME_LABEL[locale]}</Link>
            <span className="legal-crumbs-sep">/</span>
            <span className="legal-crumbs-current">{doc.title}</span>
          </nav>

          <header className="legal-head">
            <h1>{doc.title}</h1>
            <p className="legal-updated">{doc.updated}</p>
          </header>

          <p className="legal-intro">{doc.intro}</p>

          <div className="legal-body">
            {doc.sections.map((s, i) => (
              <section key={i} className="legal-section">
                <h2>
                  <span className="legal-section-num">{String(i + 1).padStart(2, '0')}</span>
                  {s.h}
                </h2>
                {s.p.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
