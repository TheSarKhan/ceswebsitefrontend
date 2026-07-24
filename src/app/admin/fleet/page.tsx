'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
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

  const activeSlug =
    selected ?? (categories.data && categories.data[0]?.slug) ?? null;
  const activeCategory = categories.data?.find((c) => c.slug === activeSlug) ?? null;

  const subsByCategory = useMemo(() => {
    const map = new Map<string, FleetSubcategoryDto[]>();
    for (const s of subcategories.data ?? []) {
      const list = map.get(s.category.slug) ?? [];
      list.push(s);
      map.set(s.category.slug, list);
    }
    return map;
  }, [subcategories.data]);

  const activeSubs = useMemo(
    () => (activeSlug ? subsByCategory.get(activeSlug) ?? [] : []),
    [activeSlug, subsByCategory],
  );

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
      adminFetch<void>(`/api/v1/admin/fleet/categories/${slug}`, token, { method: 'DELETE' }, logout),
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
      adminFetch<void>(`/api/v1/admin/fleet/subcategories/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
      toast.success('Alt-kateqoriya silindi');
    },
    onError: () => toast.error('Silinmədi'),
  });

  const removeItem = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/items/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      toast.success('Texnika silindi');
    },
    onError: () => toast.error('Silinmədi'),
  });

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
      toast.success(variables.isPublished ? 'Saytda paylaşıldı' : 'Saytdan gizlədildi');
    },
    onError: () => toast.error('Dəyişiklik tətbiq olunmadı'),
  });

  const toggleItemPublish = useMutation(publishMutationOptions('items'));
  const toggleSubPublish = useMutation(publishMutationOptions('subcategories'));
  const toggleCategoryPublish = useMutation(publishMutationOptions('categories'));

  // ---- Drag reorder: persist the new slug order to the backend. ----
  const useReorderMutation = (resource: 'categories' | 'subcategories' | 'items') =>
    useMutation({
      mutationFn: (slugs: string[]) =>
        adminFetch<void>(
          `/api/v1/admin/fleet/${resource}/reorder`,
          token,
          { method: 'PATCH', body: JSON.stringify({ slugs }) },
          logout,
        ),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
        qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
        toast.success('Sıra yeniləndi');
      },
      onError: () => {
        toast.error('Sıra yadda saxlanmadı');
        qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
        qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
      },
    });
  const reorderCategories = useReorderMutation('categories');
  const reorderSubcategories = useReorderMutation('subcategories');
  const reorderItems = useReorderMutation('items');

  // Local order copies so drag feels instant; re-synced when server data changes.
  const [catOrder, setCatOrder] = useState<FleetCategoryDto[]>([]);
  const catOrderRef = useRef<FleetCategoryDto[]>([]);
  useEffect(() => {
    setCatOrder(categories.data ?? []);
    catOrderRef.current = categories.data ?? [];
  }, [categories.data]);

  const [subOrder, setSubOrder] = useState<FleetSubcategoryDto[]>([]);
  const subOrderRef = useRef<FleetSubcategoryDto[]>([]);
  useEffect(() => {
    setSubOrder(activeSubs);
    subOrderRef.current = activeSubs;
  }, [activeSubs]);

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
            <span className="admin-fleet-rail-count">{categories.data?.length ?? 0}</span>
          </div>
          <button className="admin-fleet-link-btn" onClick={() => setModal({ kind: 'category-new' })}>
            <PlusIcon /> Əlavə et
          </button>
        </header>

        <div className="admin-fleet-rail-hint">⁚⁚ tutub sürüşdür — saytda bu sıra ilə açılır</div>

        {categories.isLoading && <div className="admin-loading">Yüklənir…</div>}
        {categories.data?.length === 0 && (
          <div className="admin-table-empty" style={{ padding: 24 }}>Hələ kateqoriya yoxdur</div>
        )}

        <Reorder.Group
          as="div"
          axis="y"
          values={catOrder}
          onReorder={(next: FleetCategoryDto[]) => {
            setCatOrder(next);
            catOrderRef.current = next;
          }}
          className="admin-fleet-rail-list"
        >
          {catOrder.map((c) => (
            <CategoryCard
              key={c.slug}
              category={c}
              active={c.slug === activeSlug}
              itemCount={itemCounts.get(c.slug) ?? 0}
              onSelect={() => setSelected(c.slug)}
              onTogglePublish={() =>
                toggleCategoryPublish.mutate({ slug: c.slug, isPublished: !c.isPublished })
              }
              onDragCommit={() => reorderCategories.mutate(catOrderRef.current.map((x) => x.slug))}
            />
          ))}
        </Reorder.Group>
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
                <h2>{pickTr(activeCategory.translations, 'AZ')?.name ?? activeCategory.slug}</h2>
                <span className="admin-fleet-badge">{activeSubs.length}</span>
                <span className="admin-fleet-main-sub">
                  · {itemCounts.get(activeCategory.slug) ?? 0} texnika
                </span>
              </div>
              <div className="admin-fleet-main-actions">
                <button
                  className="admin-btn admin-btn-ghost"
                  onClick={() => setModal({ kind: 'category-edit', category: activeCategory })}
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
                  onClick={() => setModal({ kind: 'sub-new', categorySlug: activeCategory.slug })}
                >
                  + Yeni alt qovluq əlavə et
                </button>
              </div>
            </header>

            <div className="admin-fleet-list-head">
              <span>Alt qovluqlar</span>
              <span className="admin-fleet-list-hint">⁚⁚ tutub sürüşdürərək sırala</span>
            </div>

            {activeSubs.length === 0 ? (
              <div className="admin-table-empty" style={{ padding: 40 }}>
                Bu kateqoriyada hələ alt qovluq yoxdur
              </div>
            ) : (
              <Reorder.Group
                as="div"
                axis="y"
                values={subOrder}
                onReorder={(next: FleetSubcategoryDto[]) => {
                  setSubOrder(next);
                  subOrderRef.current = next;
                }}
                className="admin-fleet-list"
              >
                {subOrder.map((s) => (
                  <SubcategoryBlock
                    key={s.slug}
                    subcategory={s}
                    isOpen={expanded.has(s.slug)}
                    onToggle={() => toggleExpand(s.slug)}
                    onDragCommit={() =>
                      reorderSubcategories.mutate(subOrderRef.current.map((x) => x.slug))
                    }
                    onReorderItems={(slugs) => reorderItems.mutate(slugs)}
                    onAddItem={() => setModal({ kind: 'item-new', subcategorySlug: s.slug })}
                    onEditSub={() => setModal({ kind: 'sub-edit', subcategory: s })}
                    onDeleteSub={() => {
                      if (
                        confirm(
                          `"${pickTr(s.translations, 'AZ')?.name ?? s.slug}" silinsin? Bütün texnikalar da silinəcək.`,
                        )
                      ) {
                        removeSub.mutate(s.slug);
                      }
                    }}
                    onEditItem={(slug) => setModal({ kind: 'item-edit', itemSlug: slug })}
                    onDeleteItem={(slug) => {
                      if (confirm(`"${slug}" silinsin?`)) removeItem.mutate(slug);
                    }}
                    onToggleItemPublish={(slug, next) =>
                      toggleItemPublish.mutate({ slug, isPublished: next })
                    }
                    onToggleSubPublish={(next) =>
                      toggleSubPublish.mutate({ slug: s.slug, isPublished: next })
                    }
                  />
                ))}
              </Reorder.Group>
            )}

            <div className="admin-fleet-foot">
              {pickTr(activeCategory.translations, 'AZ')?.name ?? activeCategory.slug}:{' '}
              {activeSubs.length} alt-kateqoriya · {itemCounts.get(activeCategory.slug) ?? 0} texnika
            </div>
          </>
        )}
      </section>

      {/* ============================ MODALS ============================ */}
      <Modal
        open={modal.kind === 'category-new' || modal.kind === 'category-edit'}
        title={modal.kind === 'category-edit' ? 'Kateqoriyanı düzəliş et' : 'Yeni kateqoriya'}
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
        title={modal.kind === 'sub-edit' ? 'Alt-kateqoriyanı düzəliş et' : 'Yeni alt-kateqoriya'}
        onClose={closeModal}
        width={640}
      >
        {modal.kind === 'sub-new' && (
          <FleetSubcategoryForm defaultCategorySlug={modal.categorySlug} onSaved={closeModal} onCancel={closeModal} />
        )}
        {modal.kind === 'sub-edit' && (
          <FleetSubcategoryForm initial={modal.subcategory} onSaved={closeModal} onCancel={closeModal} />
        )}
      </Modal>

      <Modal
        open={modal.kind === 'item-new' || modal.kind === 'item-edit'}
        title={modal.kind === 'item-edit' ? 'Texnikanı düzəliş et' : 'Yeni texnika'}
        onClose={closeModal}
        width={900}
      >
        {modal.kind === 'item-new' && (
          <FleetItemForm defaultSubcategorySlug={modal.subcategorySlug} onSaved={closeModal} onCancel={closeModal} />
        )}
        {modal.kind === 'item-edit' && !!editingItem.data && (
          <FleetItemForm initial={editingItem.data as never} onSaved={closeModal} onCancel={closeModal} />
        )}
        {modal.kind === 'item-edit' && editingItem.isLoading && (
          <div className="admin-loading">Yüklənir…</div>
        )}
      </Modal>
    </div>
  );
}

/* ----------------- Category card (left rail, draggable) ----------------- */

function CategoryCard({
  category,
  active,
  itemCount,
  onSelect,
  onTogglePublish,
  onDragCommit,
}: {
  category: FleetCategoryDto;
  active: boolean;
  itemCount: number;
  onSelect: () => void;
  onTogglePublish: () => void;
  onDragCommit: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={category}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragCommit}
      className={
        'admin-fleet-rail-card' + (active ? ' is-active' : '') + (!category.isPublished ? ' is-draft' : '')
      }
    >
      <button
        className="admin-drag-handle admin-fleet-rail-grip"
        aria-label="Sürüşdür"
        title="Sürüşdürərək sırala"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripIcon />
      </button>
      <button className="admin-fleet-rail-card-body" onClick={onSelect}>
        <div className="admin-fleet-rail-card-name">{pickTr(category.translations, 'AZ')?.name ?? category.slug}</div>
        <div className="admin-fleet-rail-card-sub">
          {itemCount} texnika · {category.subcategories.length} alt
        </div>
      </button>
      <div className="admin-fleet-rail-card-toggle">
        <PublishToggle active={category.isPublished} onToggle={onTogglePublish} />
      </div>
    </Reorder.Item>
  );
}

/* ----------------- Subcategory block (draggable, with items) ----------------- */

function SubcategoryBlock({
  subcategory,
  isOpen,
  onToggle,
  onDragCommit,
  onReorderItems,
  onAddItem,
  onEditSub,
  onDeleteSub,
  onEditItem,
  onDeleteItem,
  onToggleItemPublish,
  onToggleSubPublish,
}: {
  subcategory: FleetSubcategoryDto;
  isOpen: boolean;
  onToggle: () => void;
  onDragCommit: () => void;
  onReorderItems: (slugs: string[]) => void;
  onAddItem: () => void;
  onEditSub: () => void;
  onDeleteSub: () => void;
  onEditItem: (slug: string) => void;
  onDeleteItem: (slug: string) => void;
  onToggleItemPublish: (slug: string, next: boolean) => void;
  onToggleSubPublish: (next: boolean) => void;
}) {
  const controls = useDragControls();
  const items = subcategory.items ?? [];
  const [itemOrder, setItemOrder] = useState<FleetItemCard[]>(items);
  const itemOrderRef = useRef<FleetItemCard[]>(items);
  useEffect(() => {
    setItemOrder(subcategory.items ?? []);
    itemOrderRef.current = subcategory.items ?? [];
  }, [subcategory.items]);

  return (
    <Reorder.Item
      as="div"
      value={subcategory}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragCommit}
      className={'admin-fleet-sub' + (isOpen ? ' is-open' : '')}
    >
      <div className="admin-fleet-sub-head">
        <button
          className="admin-drag-handle"
          aria-label="Sürüşdür"
          title="Sürüşdürərək sırala"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripIcon />
        </button>
        <PublishToggle active={subcategory.isPublished} onToggle={() => onToggleSubPublish(!subcategory.isPublished)} />
        <button className="admin-fleet-toggle" onClick={onToggle}>
          <ChevronIcon open={isOpen} />
          <span>{pickTr(subcategory.translations, 'AZ')?.name ?? subcategory.slug}</span>
          <span className="admin-fleet-row-count">{items.length}</span>
        </button>
        <div className="admin-fleet-sub-actions">
          <IconButton title="Texnika əlavə et" onClick={onAddItem} variant="primary"><PlusIcon /></IconButton>
          <IconButton title="Düzəliş et" onClick={onEditSub}><PencilIcon /></IconButton>
          <IconButton title="Sil" onClick={onDeleteSub} variant="danger"><TrashIcon /></IconButton>
        </div>
      </div>

      {isOpen && items.length > 0 && (
        <Reorder.Group
          as="div"
          axis="y"
          values={itemOrder}
          onReorder={(next: FleetItemCard[]) => {
            setItemOrder(next);
            itemOrderRef.current = next;
          }}
          className="admin-fleet-items"
        >
          {itemOrder.map((it) => (
            <ItemRow
              key={it.slug}
              item={it}
              onDragCommit={() => onReorderItems(itemOrderRef.current.map((x) => x.slug))}
              onEdit={() => onEditItem(it.slug)}
              onDelete={() => onDeleteItem(it.slug)}
              onTogglePublish={() => onToggleItemPublish(it.slug, !it.isPublished)}
            />
          ))}
        </Reorder.Group>
      )}

      {isOpen && items.length === 0 && (
        <div className="admin-fleet-item-empty">
          Bu alt-kateqoriyada hələ texnika yoxdur.{' '}
          <button className="admin-fleet-link-btn" onClick={onAddItem}>Texnika əlavə et</button>
        </div>
      )}
    </Reorder.Item>
  );
}

/* ----------------- Item row (draggable) ----------------- */

function ItemRow({
  item,
  onDragCommit,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  item: FleetItemCard;
  onDragCommit: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragCommit}
      className="admin-fleet-item"
    >
      <button
        className="admin-drag-handle"
        aria-label="Sürüşdür"
        title="Sürüşdürərək sırala"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripIcon />
      </button>
      <PublishToggle active={item.isPublished} onToggle={onTogglePublish} />
      {item.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="admin-fleet-item-thumb" />
      )}
      <div className="admin-fleet-item-info">
        <div className="admin-fleet-item-name">{pickTr(item.translations, 'AZ')?.name ?? item.slug}</div>
        <div className="admin-fleet-item-meta">
          {item.modelNumber && <span className="mono">{item.modelNumber}</span>}
          {item.price && (
            <span>
              {item.price}
              {item.priceUnit && <span style={{ color: 'var(--fg-3)' }}>/{item.priceUnit}</span>}
            </span>
          )}
        </div>
      </div>
      <div className="admin-fleet-item-actions">
        <IconButton title="Düzəliş et" onClick={onEdit}><PencilIcon /></IconButton>
        <IconButton title="Sil" onClick={onDelete} variant="danger"><TrashIcon /></IconButton>
      </div>
    </Reorder.Item>
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
      className={'admin-icon-btn' + (variant === 'primary' ? ' is-primary' : '') + (variant === 'danger' ? ' is-danger' : '')}
    >
      {children}
    </button>
  );
}

function PublishToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
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

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </g>
    </svg>
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
      <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
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
      style={{ transition: 'transform .15s ease', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
