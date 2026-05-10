'use client';

import { Icon } from './icons';
import { useLang } from '@/lib/lang';
import { useOfferings } from '@/lib/hooks';
import { pickTr } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

export function Services() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useOfferings();
  const items = isError ? [] : (data ?? []);

  return (
    <section id="services" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>
            {t.services_h}
            <br />
            <span className="stroke">{t.services_h_stroke}</span>
          </h2>
          <div className="meta">{t.services_meta}</div>
        </Reveal>

        <StaggerGroup className="services-grid">
          {items.map((it) => {
            const tr = pickTr(it.translations, lang);
            return (
              <StaggerItem key={it.slug} className="service">
                <div className="num">{tr?.eyebrow}</div>
                {it.icon && (
                  <div className="service-icon">
                    <Icon name={it.icon} size={48} stroke={1.4} />
                  </div>
                )}
                <h3>{tr?.title}</h3>
                <p>{tr?.description}</p>
                <span className="arrow">
                  {lang === 'AZ' ? 'Ətraflı' : lang === 'RU' ? 'Подробнее' : 'Details'}{' '}
                  <Icon name="arrow-right" size={12} stroke={2.5} />
                </span>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
