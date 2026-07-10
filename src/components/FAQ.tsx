'use client';

import { useLang } from '@/lib/lang';
import { useFaqs } from '@/lib/hooks';
import { pickTr } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function FAQ({
  initialFaqs,
}: {
  initialFaqs?: import('@/lib/types').FaqDto[];
} = {}) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useFaqs(initialFaqs);
  const faqs = isError ? [] : (data ?? []);

  return (
    <section id="faq" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>
            {t.faq_h}
            <br />
            <span className="stroke">
              {lang === 'AZ' ? 'Suallar.' : lang === 'RU' ? 'Вопросы.' : 'Questions.'}
            </span>
          </h2>
          <div className="meta">
            {t.faq_meta}
            <br />
            +994 50 682 90 80
          </div>
        </Reveal>

        <StaggerGroup className="faq-list" stagger={0.05}>
          {faqs.map((f) => {
            const tr = pickTr(f.translations, lang);
            return (
              <StaggerItem key={f.id}>
                <details className="faq">
                  <summary>
                    <span className="q">{tr?.question}</span>
                    <span className="toggle">+</span>
                  </summary>
                  <div className="a">{tr?.answer}</div>
                </details>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
