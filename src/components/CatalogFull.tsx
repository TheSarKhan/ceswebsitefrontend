'use client';

import Link from 'next/link';
import { useFleetCategories, useFleetSubcategory } from '@/lib/hooks';
import { pickTr, type FleetCategoryDto } from '@/lib/types';
import { useLang } from '@/lib/lang';
import { type Lang } from '@/lib/translations';
import { FleetCard } from './Fleet';
import { Reveal } from './motion';

const T: Record<
  Lang,
  { title: string; lead: string; jump: string; empty: string; home: string; crumb: string }
> = {
  AZ: {
    title: 'Texnika Kataloqu',
    lead: 'Bütün texnika parkımız — kateqoriyalar üzrə. İstənilən modeli seçib operatorla icarə edin.',
    jump: 'Keçidlər',
    empty: 'Hələ texnika əlavə olunmayıb.',
    home: 'Ana səhifə',
    crumb: 'Kataloq',
  },
  RU: {
    title: 'Каталог Техники',
    lead: 'Весь наш парк техники — по категориям. Выберите модель и арендуйте с оператором.',
    jump: 'Разделы',
    empty: 'Техника пока не добавлена.',
    home: 'Главная',
    crumb: 'Каталог',
  },
  EN: {
    title: 'Equipment Catalog',
    lead: 'Our full equipment fleet — grouped by category. Pick a model and rent it with an operator.',
    jump: 'Sections',
    empty: 'No equipment added yet.',
    home: 'Home',
    crumb: 'Catalog',
  },
};

/** Renders one subcategory's item cards (fetches its own items, react-query caches). */
function SubcatSection({
  slug,
  categoryName,
  lang,
  hideLabel,
}: {
  slug: string;
  categoryName: string | null;
  lang: Lang;
  hideLabel: boolean;
}) {
  const { data } = useFleetSubcategory(slug);
  const items = data?.items ?? [];
  if (items.length === 0) return null;
  const subName = pickTr(data?.translations, lang)?.name;

  return (
    <div className="catalog-sub">
      {!hideLabel && subName && <h3 className="catalog-sub-title">{subName}</h3>}
      <div className="fleet-grid">
        {items.map((it) => (
          <FleetCard key={it.slug} item={it} lang={lang} categoryName={categoryName} />
        ))}
      </div>
    </div>
  );
}

export function CatalogFull({
  initialCategories,
}: {
  initialCategories?: FleetCategoryDto[];
}) {
  const { lang } = useLang();
  const t = T[lang];
  const { data, isError } = useFleetCategories(initialCategories);
  const categories =
    isError || !data
      ? []
      : data.filter((c) => c.subcategories.some((s) => (s.itemCount ?? 0) > 0));

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

        {categories.length === 0 ? (
          <div className="fleet-empty">{t.empty}</div>
        ) : (
          <div className="catalog-layout">
            <aside className="catalog-nav" aria-label={t.jump}>
              <span className="catalog-nav-label">{t.jump}</span>
              {categories.map((c) => (
                <a key={c.slug} href={`#cat-${c.slug}`}>
                  {pickTr(c.translations, lang)?.name ?? c.slug}
                </a>
              ))}
            </aside>

            <div className="catalog-main">
              {categories.map((c) => {
                const name = pickTr(c.translations, lang)?.name ?? c.slug;
                const subs = c.subcategories.filter((s) => (s.itemCount ?? 0) > 0);
                const single = subs.length === 1;
                return (
                  <section key={c.slug} id={`cat-${c.slug}`} className="catalog-cat">
                    <h2 className="catalog-cat-title">{name}</h2>
                    {subs.map((s) => (
                      <SubcatSection
                        key={s.slug}
                        slug={s.slug}
                        categoryName={name}
                        lang={lang}
                        hideLabel={single}
                      />
                    ))}
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
