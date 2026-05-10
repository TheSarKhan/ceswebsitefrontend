'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFleetCategories, useFleetSubcategory } from '@/lib/hooks';
import { pickTr, type FleetItemCard } from '@/lib/types';
import { useLang } from '@/lib/lang';
import { TRANSLATIONS, type Lang } from '@/lib/translations';
import { Icon } from './icons';
import { Placeholder } from './Hero';
import { Reveal, StaggerGroup, StaggerItem } from './motion';

const UNIT_LABELS: Record<string, Record<Lang, string>> = {
  day:   { AZ: 'gün',   RU: 'день',   EN: 'day' },
  hour:  { AZ: 'saat',  RU: 'час',    EN: 'hour' },
  week:  { AZ: 'həftə', RU: 'неделя', EN: 'week' },
  month: { AZ: 'ay',    RU: 'месяц',  EN: 'month' },
};

function formatUnit(unit: string | null | undefined, lang: Lang) {
  if (!unit) return null;
  return UNIT_LABELS[unit]?.[lang] ?? unit;
}

export function Fleet() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useFleetCategories();
  const categories = useMemo(() => (isError ? [] : (data ?? [])), [data, isError]);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // Default to the first category once data arrives.
  useEffect(() => {
    if (!activeCat && categories.length > 0) {
      setActiveCat(categories[0].slug);
    }
  }, [categories, activeCat]);

  // Whenever the active category changes (or finishes loading), make sure the
  // active subcategory belongs to it — otherwise reset to the first one.
  useEffect(() => {
    const cat = categories.find((c) => c.slug === activeCat);
    if (!cat) return;
    const subBelongs = cat.subcategories.some((s) => s.slug === activeSub);
    if (!subBelongs) {
      setActiveSub(cat.subcategories[0]?.slug ?? null);
    }
  }, [categories, activeCat, activeSub]);

  const activeCategory = categories.find((c) => c.slug === activeCat);
  const subcategories = activeCategory?.subcategories ?? [];

  const { data: subDetail } = useFleetSubcategory(activeSub);
  const items = subDetail?.items ?? [];

  return (
    <section id="fleet" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>
            {t.fleet_h1}
            <br />
            <span className="stroke">{t.fleet_h2}</span>
          </h2>
          <div className="meta">
            {t.fleet_meta}
            <br />
            {t.fleet_location}
          </div>
        </Reveal>

        {/* Tier 1 — categories */}
        <Reveal className="fleet-tabs" delay={0.1}>
          {categories.map((c) => {
            const tr = pickTr(c.translations, lang);
            const isActive = activeCat === c.slug;
            return (
              <button
                key={c.slug}
                className={'fleet-tab ' + (isActive ? 'active' : '')}
                onClick={() => setActiveCat(c.slug)}
              >
                {tr?.name}{' '}
                <span className="count">[{c.subcategories.length}]</span>
              </button>
            );
          })}
        </Reveal>

        {/* Tier 2 — subcategories of the active category */}
        {subcategories.length > 0 && (
          <Reveal className="fleet-subs" delay={0.15}>
            {subcategories.map((s) => {
              const tr = pickTr(s.translations, lang);
              const isActive = activeSub === s.slug;
              return (
                <button
                  key={s.slug}
                  className={'fleet-sub ' + (isActive ? 'active' : '')}
                  onClick={() => setActiveSub(s.slug)}
                >
                  {tr?.name}
                </button>
              );
            })}
          </Reveal>
        )}

        {/* Tier 3 — equipment cards inside the active subcategory */}
        <StaggerGroup className="fleet-grid" stagger={0.06}>
          {items.map((item) => (
            <StaggerItem key={item.slug}>
              <FleetCard item={item} lang={lang} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        {activeSub && items.length === 0 && subDetail && (
          <div className="fleet-empty">
            {lang === 'AZ'
              ? 'Bu alt-kateqoriyada hələ texnika yoxdur.'
              : lang === 'RU'
                ? 'В этой подкатегории пока нет техники.'
                : 'No equipment in this subcategory yet.'}
          </div>
        )}

        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
          <a href="#contact" className="btn btn-ghost btn-arrow">
            {t.fleet_btn}
            <Icon name="arrow-right" size={14} stroke={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}

function FleetCard({ item, lang }: { item: FleetItemCard; lang: Lang }) {
  const tr = pickTr(item.translations, lang);
  const unit = formatUnit(item.priceUnit, lang);

  return (
    <article className="card-a">
      <div className="img">
        {tr?.badge && <span className="badge">{tr.badge}</span>}
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={tr?.name ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
          />
        ) : (
          <Placeholder label={item.modelNumber ?? item.slug} />
        )}
      </div>
      <div className="body">
        {item.modelNumber && (
          <div className="cat">{item.modelNumber}</div>
        )}
        <h4>{tr?.name}</h4>
        {tr?.description && <p className="card-desc">{tr.description}</p>}
        <div className="foot">
          {item.price && (
            <div className="price">
              {item.price}
              {unit && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--fg-3)',
                    marginLeft: 4,
                  }}
                >
                  /{unit}
                </span>
              )}
            </div>
          )}
          <a className="req" href="#contact">
            {lang === 'AZ' ? 'Sifariş et' : lang === 'RU' ? 'Заказать' : 'Order Now'} →
          </a>
        </div>
      </div>
    </article>
  );
}
