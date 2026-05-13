'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import {
  pickTr,
  type FleetCategoryDto,
  type FleetSubcategoryDto,
  type FleetItemCard,
} from '@/lib/types';
import { Modal } from '@/components/admin/Modal';
import { FleetCategoryForm } from '@/components/admin/FleetCategoryForm';
import { FleetSubcategoryForm } from '@/components/admin/FleetSubcategoryForm';
import { FleetItemForm } from '@/components/admin/FleetItemForm';
import { useToast } from '@/components/admin/ToastProvider';

type ModalState =
  | { kind: 'none' }
  | { kind: 'category-new' }
  | { kind: 'category-edit'; category: FleetCategoryDto }
  | { kind: 'sub-new'; categorySlug: string }
  | { kind: 'sub-edit'; subcategory: FleetSubcategoryDto }
  | { kind: 'item-new'; subcategorySlug: string }
  | { kind: 'item-edit'; itemSlug: string };

export default function FleetAdminPage() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const categories = useQuery({
    queryKey: ['admin', 'fleet', 'categories'],
    queryFn: () =>
      adminFetch<FleetCategoryDto[]>('/api/v1/admin/fleet/categories', token, {}, logout),
    enabled: !!token,
  });

  const subcategories = useQuery({
    queryKey: ['admin', 'fleet', 'subcategories'],
    queryFn: () =>
      adminFetch<FleetSubcategoryDto[]>(
        '/api/v1/admin/fleet/subcategories',
        token,
        {},
        logout,
      ),
    enabled: !!token,
  });

  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  // Pick a default category once data arrives.
  const activeSlug =
    selected ?? (categories.data && categories.data[0]?.slug) ?? null;
  const activeCategory = categories.data?.find((c) => c.slug === activeSlug) ?? null;

  // Subcategories grouped by category slug.
  const subsByCategory = useMemo(() => {
    const map = new Map<string, FleetSubcategoryDto[]>();
    for (const s of subcategories.data ?? []) {
      const list = map.get(s.category.slug) ?? [];
      list.push(s);
      map.set(s.category.slug, list);
    }
    return map;
  }, [subcategories.data]);

  const activeSubs = activeSlug ? subsByCategory.get(activeSlug) ?? [] : [];

  // Item counts for each category (sum across its subcategories).
  const itemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of subcategories.data ?? []) {
      counts.set(
        s.category.slug,
        (counts.get(s.category.slug) ?? 0) + (s.items?.length ?? 0),
      );
    }
    return counts;
  }, [subcategories.data]);

  // Fetch full item for editing (the list endpoint returns a Card, the form
  // wants the full FleetItemDto with specs).
  const editingItem = useQuery({
    queryKey: ['admin', 'fleet', 'item', modal.kind === 'item-edit' ? modal.itemSlug : null],
    queryFn: () =>
      adminFetch(
        `/api/v1/admin/fleet/items/${modal.kind === 'item-edit' ? modal.itemSlug : ''}`,
        token,
        {},
        logout,
      ),
    enabled: modal.kind === 'item-edit' && !!token,
  });

  const removeCategory = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(
        `/api/v1/admin/fleet/categories/${slug}`,
        token,
        { method: 'DELETE' },
        logout,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      toast.success('Kateqoriya silindi');
      setSelected(null);
    },
    onError: () => toast.error('Silinmədi'),
  });

  const removeSub = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(
        `/api/v1/admin/fleet/subcategories/${slug}`,
        token,
        { method: 'DELETE' },
        logout,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
      toast.success('Alt-kateqoriya silindi');
    },
    onError: () => toast.error('Silinmədi'),
  });

  const removeItem = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(
        `/api/v1/admin/fleet/items/${slug}`,
        token,
        { method: 'DELETE' },
        logout,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      toast.success('Texnika silindi');
    },
    onError: () => toast.error('Silinmədi'),
  });

  // Inline publish/unpublish toggles — switch the published flag without
  // opening the full edit form. Three siblings rather than one factory so we
  // don't break the rules-of-hooks (useMutation must be called at top level).
  const publishMutationOptions = (resource: 'items' | 'subcategories' | 'categories') => ({
    mutationFn: ({ slug, isPublished }: { slug: string; isPublished: boolean }) =>
      adminFetch(
        `/api/v1/admin/fleet/${resource}/${slug}/publish`,
        token,
        { method: 'PATCH', body: JSON.stringify({ isPublished }) },
        logout,
      ),
    onSuccess: (_data: unknown, variables: { isPublished: boolean }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
      toast.success(
        variables.isPublished ? 'Saytda paylaşıldı' : 'Saytdan gizlədildi',
      );
    },
    onError: () => toast.error('Dəyişiklik tətbiq olunmadı'),
  });

  const toggleItemPublish = useMutation(publishMutationOptions('items'));
  const toggleSubPublish = useMutation(publishMutationOptions('subcategories'));
  const toggleCategoryPublish = useMutation(publishMutationOptions('categories'));

  function toggleExpand(slug: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function closeModal() {
    setModal({ kind: 'none' });
  }

  return (
    <div className="admin-fleet-shell">
      {/* ============================ LEFT RAIL ============================ */}
      <aside className="admin-fleet-rail">
        <header className="admin-fleet-rail-head">
          <div>
            <span className="admin-fleet-rail-title">Kateqoriyalar</span>
            <span className="admin-fleet-rail-count">
              {categories.data?.length ?? 0}
            </span>
          </div>
          <button
            className="admin-fleet-link-btn"
            onClick={() => setModal({ kind: 'category-new' })}
          >
            <PlusIcon /> Əlavə et
          </button>
        </header>

        <div className="admin-fleet-rail-list">
          {categories.isLoading && <div className="admin-loading">Yüklənir…</div>}
          {categories.data?.length === 0 && (
            <div className="admin-table-empty" style={{ padding: 24 }}>
              Hələ kateqoriya yoxdur
            </div>
          )}
          {(categories.data ?? []).map((c) => {
            const active = c.slug === activeSlug;
            return (
              <div
                key={c.slug}
                className={
                  'admin-fleet-rail-card' +
                  (active ? ' is-active' : '') +
                  (!c.isPublished ? ' is-draft' : '')
                }
              >
                <button
                  className="admin-fleet-rail-card-body"
                  onClick={() => setSelected(c.slug)}
                >
                  <div className="admin-fleet-rail-card-name">
                    {pickTr(c.translations, 'AZ')?.name ?? c.slug}
                  </div>
                  <div className="admin-fleet-rail-card-sub">
                    {itemCounts.get(c.slug) ?? 0} texnika ·{' '}
                    {c.subcategories.length} alt
                  </div>
                </button>
                <div className="admin-fleet-rail-card-toggle">
                  <PublishToggle
                    active={c.isPublished}
                    onToggle={() =>
                      toggleCategoryPublish.mutate({
                        slug: c.slug,
                        isPublished: !c.isPublished,
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ============================ MAIN PANEL ============================ */}
      <section className="admin-fleet-main">
        {!activeCategory && !categories.isLoading && (
          <div className="admin-table-empty" style={{ padding: 60 }}>
            Soldan kateqoriya seçin və ya yenisini yaradın
          </div>
        )}

        {activeCategory && (
          <>
            <header className="admin-fleet-main-head">
              <div className="admin-fleet-main-title">
                <h2>
                  {pickTr(activeCategory.translations, 'AZ')?.name ??
                    activeCategory.slug}
                </h2>
                <span className="admin-fleet-badge">
                  {activeSubs.length}
                </span>
                <span className="admin-fleet-main-sub">
                  · {itemCounts.get(activeCategory.slug) ?? 0} texnika
                </span>
              </div>
              <div className="admin-fleet-main-actions">
                <button
                  className="admin-btn admin-btn-ghost"
                  onClick={() =>
                    setModal({ kind: 'category-edit', category: activeCategory })
                  }
                >
                  <PencilIcon /> Düzəliş et
                </button>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    if (
                      confirm(
                        `"${pickTr(activeCategory.translations, 'AZ')?.name ?? activeCategory.slug}" silinsin? Bütün alt-kateqoriyalar və texnikalar da silinəcək.`,
                      )
                    ) {
                      removeCategory.mutate(activeCategory.slug);
                    }
                  }}
                  disabled={removeCategory.isPending}
                >
                  <TrashIcon /> Sil
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={() =>
                    setModal({
                      kind: 'sub-new',
                      categorySlug: activeCategory.slug,
                    })
                  }
                >
                  + Yeni alt qovluq əlavə et
                </button>
              </div>
            </header>

            <table className="admin-fleet-table">
              <colgroup>
                <col />
                <col style={{ width: 148 }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Alt qovluqlar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeSubs.length === 0 && (
                  <tr>
                    <td colSpan={2} className="admin-table-empty">
                      Bu kateqoriyada hələ alt qovluq yoxdur
                    </td>
                  </tr>
                )}
                {activeSubs.map((s) => {
                  const isOpen = expanded.has(s.slug);
                  const items = s.items ?? [];
                  return (
                    <FleetSubRow
                      key={s.slug}
                      subcategory={s}
                      items={items}
                      isOpen={isOpen}
                      onToggle={() => toggleExpand(s.slug)}
                      onAddItem={() =>
                        setModal({ kind: 'item-new', subcategorySlug: s.slug })
                      }
                      onEditSub={() =>
                        setModal({ kind: 'sub-edit', subcategory: s })
                      }
                      onDeleteSub={() => {
                        if (
                          confirm(
                            `"${pickTr(s.translations, 'AZ')?.name ?? s.slug}" silinsin? Bütün texnikalar da silinəcək.`,
                          )
                        ) {
                          removeSub.mutate(s.slug);
                        }
                      }}
                      onEditItem={(slug) =>
                        setModal({ kind: 'item-edit', itemSlug: slug })
                      }
                      onDeleteItem={(slug) => {
                        if (confirm(`"${slug}" silinsin?`)) {
                          removeItem.mutate(slug);
                        }
                      }}
                      onToggleItemPublish={(slug, next) =>
                        toggleItemPublish.mutate({ slug, isPublished: next })
                      }
                      onToggleSubPublish={(next) =>
                        toggleSubPublish.mutate({ slug: s.slug, isPublished: next })
                      }
                    />
                  );
                })}
              </tbody>
            </table>

            <div className="admin-fleet-foot">
              {pickTr(activeCategory.translations, 'AZ')?.name ??
                activeCategory.slug}
              : {activeSubs.length} alt-kateqoriya ·{' '}
              {itemCounts.get(activeCategory.slug) ?? 0} texnika
            </div>
          </>
        )}
      </section>

      {/* ============================ MODALS ============================ */}
      <Modal
        open={modal.kind === 'category-new' || modal.kind === 'category-edit'}
        title={
          modal.kind === 'category-edit'
            ? 'Kateqoriyanı düzəliş et'
            : 'Yeni kateqoriya'
        }
        onClose={closeModal}
        width={640}
      >
        {(modal.kind === 'category-new' || modal.kind === 'category-edit') && (
          <FleetCategoryForm
            initial={modal.kind === 'category-edit' ? modal.category : undefined}
            onSaved={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal
        open={modal.kind === 'sub-new' || modal.kind === 'sub-edit'}
        title={
          modal.kind === 'sub-edit'
            ? 'Alt-kateqoriyanı düzəliş et'
            : 'Yeni alt-kateqoriya'
        }
        onClose={closeModal}
        width={640}
      >
        {modal.kind === 'sub-new' && (
          <FleetSubcategoryForm
            defaultCategorySlug={modal.categorySlug}
            onSaved={closeModal}
            onCancel={closeModal}
          />
        )}
        {modal.kind === 'sub-edit' && (
          <FleetSubcategoryForm
            initial={modal.subcategory}
            onSaved={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal
        open={modal.kind === 'item-new' || modal.kind === 'item-edit'}
        title={
          modal.kind === 'item-edit' ? 'Texnikanı düzəliş et' : 'Yeni texnika'
        }
        onClose={closeModal}
        width={900}
      >
        {modal.kind === 'item-new' && (
          <FleetItemForm
            defaultSubcategorySlug={modal.subcategorySlug}
            onSaved={closeModal}
            onCancel={closeModal}
          />
        )}
        {modal.kind === 'item-edit' && editingItem.data && (
          <FleetItemForm
            initial={editingItem.data as never}
            onSaved={closeModal}
            onCancel={closeModal}
          />
        )}
        {modal.kind === 'item-edit' && editingItem.isLoading && (
          <div className="admin-loading">Yüklənir…</div>
        )}
      </Modal>
    </div>
  );
}

/* ----------------- Row component (subcategory + items) ----------------- */

function FleetSubRow({
  subcategory,
  items,
  isOpen,
  onToggle,
  onAddItem,
  onEditSub,
  onDeleteSub,
  onEditItem,
  onDeleteItem,
  onToggleItemPublish,
  onToggleSubPublish,
}: {
  subcategory: FleetSubcategoryDto;
  items: FleetItemCard[];
  isOpen: boolean;
  onToggle: () => void;
  onAddItem: () => void;
  onEditSub: () => void;
  onDeleteSub: () => void;
  onEditItem: (slug: string) => void;
  onDeleteItem: (slug: string) => void;
  onToggleItemPublish: (slug: string, nextState: boolean) => void;
  onToggleSubPublish: (nextState: boolean) => void;
}) {
  return (
    <>
      <tr className={'admin-fleet-row' + (isOpen ? ' is-open' : '')}>
        <td>
          <div className="admin-fleet-row-head">
            <PublishToggle
              active={subcategory.isPublished}
              onToggle={() => onToggleSubPublish(!subcategory.isPublished)}
            />
            <button className="admin-fleet-toggle" onClick={onToggle}>
              <ChevronIcon open={isOpen} />
              <span>
                {pickTr(subcategory.translations, 'AZ')?.name ?? subcategory.slug}
              </span>
              <span className="admin-fleet-row-count">{items.length}</span>
            </button>
          </div>
        </td>
        <td className="admin-table-actions">
          <IconButton title="Texnika əlavə et" onClick={onAddItem} variant="primary">
            <PlusIcon />
          </IconButton>
          <IconButton title="Düzəliş et" onClick={onEditSub}>
            <PencilIcon />
          </IconButton>
          <IconButton title="Sil" onClick={onDeleteSub} variant="danger">
            <TrashIcon />
          </IconButton>
        </td>
      </tr>

      {isOpen &&
        items.map((it) => (
          <tr key={it.slug} className="admin-fleet-item-row">
            <td>
              <div className="admin-fleet-item-cell">
                <PublishToggle
                  active={it.isPublished}
                  onToggle={() => onToggleItemPublish(it.slug, !it.isPublished)}
                />
                {it.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" className="admin-fleet-item-thumb" />
                )}
                <div className="admin-fleet-item-info">
                  <div className="admin-fleet-item-name">
                    {pickTr(it.translations, 'AZ')?.name ?? it.slug}
                  </div>
                  <div className="admin-fleet-item-meta">
                    {it.modelNumber && <span className="mono">{it.modelNumber}</span>}
                    {it.price && (
                      <span>
                        {it.price}
                        {it.priceUnit && (
                          <span style={{ color: 'var(--fg-3)' }}>/{it.priceUnit}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </td>
            <td className="admin-table-actions">
              <IconButton title="Düzəliş et" onClick={() => onEditItem(it.slug)}>
                <PencilIcon />
              </IconButton>
              <IconButton
                title="Sil"
                onClick={() => onDeleteItem(it.slug)}
                variant="danger"
              >
                <TrashIcon />
              </IconButton>
            </td>
          </tr>
        ))}

      {isOpen && items.length === 0 && (
        <tr className="admin-fleet-item-row">
          <td colSpan={2} className="admin-fleet-item-empty">
            Bu alt-kateqoriyada hələ texnika yoxdur.{' '}
            <button className="admin-fleet-link-btn" onClick={onAddItem}>
              Texnika əlavə et
            </button>
          </td>
        </tr>
      )}
    </>
  );
}

/* ----------------- Icon button + inline SVGs ----------------- */

function IconButton({
  children,
  onClick,
  title,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'primary' | 'danger';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={
        'admin-icon-btn' +
        (variant === 'primary' ? ' is-primary' : '') +
        (variant === 'danger' ? ' is-danger' : '')
      }
    >
      {children}
    </button>
  );
}

function PublishToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={active}
      title={active ? 'Saytda paylaşılıb — gizlətmək üçün klikləyin' : 'Saytda gizlədilib — paylaşmaq üçün klikləyin'}
      className={'admin-fleet-publish-toggle' + (active ? ' is-on' : '')}
    >
      <span className="admin-fleet-publish-knob" />
    </button>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 20h4l10-10-4-4L4 16v4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transition: 'transform .15s ease',
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
      }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      style={{ marginLeft: 'auto', color: 'var(--gold)' }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
