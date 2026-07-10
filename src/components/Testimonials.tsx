'use client';

import { useLang } from '@/lib/lang';
import { useTestimonials } from '@/lib/hooks';
import { pickTr } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function Testimonials({
  initialTestimonials,
}: {
  initialTestimonials?: import('@/lib/types').TestimonialDto[];
} = {}) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useTestimonials(initialTestimonials);
  const items = isError ? [] : (data ?? []);

  return (
    <section className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t.test_h}</h2>
        </Reveal>

        <StaggerGroup className="test-grid" stagger={0.07}>
          {items.map((item) => {
            const tr = pickTr(item.translations, lang);
            return (
              <StaggerItem key={item.id} className="testimonial">
                <div className="quote-mark">&ldquo;</div>
                <p>{tr?.quote}</p>
                <div className="author">
                  <div className="avatar">{item.initials}</div>
                  <div className="author-meta">
                    <div className="name">{item.name}</div>
                    <div className="role">{tr?.role}</div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
