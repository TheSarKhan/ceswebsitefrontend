'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFleetCategories, useFleetSubcategory } from '@/lib/hooks';
import { pickTr, type FleetItemCard } from '@/lib/types';
import { useLang } from '@/lib/lang';
import { useOrder } from '@/contexts/OrderContext';
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

export function Fleet({
  initialCategories,
}: {
  initialCategories?: import('@/lib/types').FleetCategoryDto[];
} = {}) {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang];
  const { data, isError } = useFleetCategories(initialCategories);
  // Visitors only see categories that actually have published items —
  // an empty crane category is just confusion in the navigation.
  const categories = useMemo(() => {
    if (isError || !data) return [];
    return data.filter((c) =>
      c.subcategories.some((s) => (s.itemCount ?? 0) > 0),
    );
  }, [data, isError]);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // Prefer the first category that actually has published content, falling
  // back to the first category overall — otherwise the user lands on an empty
  // tab even when other categories have items.
  useEffect(() => {
    if (activeCat || categories.length === 0) return;
    const withContent = categories.find((c) =>
      c.subcategories.some((s) => (s.itemCount ?? 0) > 0),
    );
    setActiveCat((withContent ?? categories[0]).slug);
  }, [categories, activeCat]);

  // Whenever the active category changes, pick the first subcategory that has
  // items; if none do, just pick the first subcategory so the user still sees
  // a labelled empty state.
  useEffect(() => {
    const cat = categories.find((c) => c.slug === activeCat);
    if (!cat) return;
    const subBelongs = cat.subcategories.some((s) => s.slug === activeSub);
    if (!subBelongs) {
      const withItems = cat.subcategories.find((s) => (s.itemCount ?? 0) > 0);
      setActiveSub((withItems ?? cat.subcategories[0])?.slug ?? null);
    }
  }, [categories, activeCat, activeSub]);

  const activeCategory = categories.find((c) => c.slug === activeCat);
  // Hide subcategories that have no published items — visitors should never
  // click into an empty section. Admins can still see them in /admin/fleet.
  const subcategories = (activeCategory?.subcategories ?? []).filter(
    (s) => (s.itemCount ?? 0) > 0,
  );

  const { data: subDetail } = useFleetSubcategory(activeSub);
  const items = subDetail?.items ?? [];

  return (
    <section id="fleet" className="section-pad">
      <div className="container">
        <Reveal className="section-head">
          <h2>{t.fleet_h1}</h2>
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
                {tr?.name}
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

        {categories.length === 0 && !isError && (
          <div className="fleet-empty">
            {lang === 'AZ'
              ? 'Heç bir kateqoriya tapılmadı.'
              : lang === 'RU'
                ? 'Категории не найдены.'
                : 'No categories found.'}
          </div>
        )}

        {/* Tier 3 — equipment cards inside the active subcategory.
            Keyed by activeSub so switching subcategories forces a full remount
            and re-runs the stagger animation; otherwise new items would
            inherit the parent's already-completed "show" state and remain at
            opacity 0. */}
        {items.length > 0 && (
          <StaggerGroup
            key={activeSub ?? 'none'}
            className="fleet-grid"
            stagger={0.06}
          >
            {items.map((item) => (
              <StaggerItem key={item.slug}>
                <FleetCard item={item} lang={lang} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}

        {activeSub && items.length === 0 && (
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
  const { setSelectedEquipment } = useOrder();
  const equipmentName = tr?.name ?? item.modelNumber ?? item.slug;
  const href = `/${lang.toLowerCase()}/texnika/${item.slug}`;

  return (
    <article className="card-a">
      <Link href={href} className="img" aria-label={equipmentName}>
        {tr?.badge && <span className="badge">{tr.badge}</span>}
        {item.image ? (
          <Image
            src={item.image}
            alt={tr?.name ?? item.modelNumber ?? item.slug}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <Placeholder label={item.modelNumber ?? item.slug} />
        )}
      </Link>
      <div className="body">
        <Link href={href} className="card-title-link"><h4>{tr?.name}</h4></Link>
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
          <a
            className="req"
            href="#contact"
            onClick={() => setSelectedEquipment(equipmentName)}
          >
            {lang === 'AZ' ? 'Sifariş et' : lang === 'RU' ? 'Заказать' : 'Order Now'} →
          </a>
        </div>
      </div>
    </article>
  );
}
