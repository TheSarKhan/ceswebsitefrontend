'use client';

import Image from 'next/image';
import { Icon } from './icons';
import { useLang } from '@/lib/lang';
import { useOfferings } from '@/lib/hooks';
import { pickTr } from '@/lib/types';
import { TRANSLATIONS } from '@/lib/translations';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

// Distinguish an uploaded image URL from a legacy component slug ("crane",
// "tools"). Once all offerings have re-uploaded icons via admin, the legacy
// branch can be removed.
function isImageUrl(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('/');
}

export function Services({
  initialOfferings,
}: {
  initialOfferings?: import('@/lib/types').OfferingDto[];
} = {}) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useOfferings(initialOfferings);
  const items = isError ? [] : (data ?? []);

  return (
    <section id="services" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t.services_h}</h2>
        </Reveal>

        <StaggerGroup className="services-grid">
          {items.map((it) => {
            const tr = pickTr(it.translations, lang);
            return (
              <StaggerItem key={it.slug} className="service">
                {it.icon && (
                  <div className="service-icon">
                    {isImageUrl(it.icon) ? (
                      <Image
                        src={it.icon}
                        alt={tr?.title ?? it.slug}
                        width={64}
                        height={64}
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                      />
                    ) : (
                      <Icon name={it.icon} size={48} stroke={1.4} />
                    )}
                  </div>
                )}
                <h3>{tr?.title}</h3>
                <p>{tr?.description}</p>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
