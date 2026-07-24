'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FleetItemCard } from '@/lib/types';
import { ReorderList } from '@/components/admin/ReorderList';
import { useToast } from '@/components/admin/ToastProvider';

/** Group items into insertion-ordered buckets by a key. */
function groupByOrdered<T>(arr: T[], keyFn: (t: T) => string): Array<[string, T[]]> {
  const map = new Map<string, T[]>();
  for (const item of arr) {
    const k = keyFn(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return [...map.entries()];
}

export default function FleetItemsList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'items'],
    queryFn: () => adminFetch<FleetItemCard[]>('/api/v1/admin/fleet/items', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/items/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'items'] }),
  });

  const reorder = useMutation({
    mutationFn: (slugs: string[]) =>
      adminFetch<void>('/api/v1/admin/fleet/items/reorder', token, {
        method: 'PATCH',
        body: JSON.stringify({ slugs }),
      }, logout),
    onSuccess: () => {
      toast.success('Sıra yeniləndi');
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'items'] });
    },
    onError: () => {
      toast.error('Sıra yadda saxlanmadı');
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'items'] });
    },
  });

  const groups = data
    ? groupByOrdered(data, (it) => it.subcategorySlug ?? '—')
    : [];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Texnika</h1>
          <p className="admin-page-sub">
            Üçüncü pillə. Hər alt-kateqoriyanın içində ⠿ tutub sürüşdürərək sıralayın.
          </p>
        </div>
        <Link href="/admin/fleet/items/new" className="admin-btn admin-btn-primary">+ Əlavə et</Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && data.length === 0 && (
        <div className="admin-table-empty">Hələ texnika yoxdur.</div>
      )}

      {groups.map(([subSlug, items]) => (
        <section key={subSlug} className="admin-reorder-section">
          <h2 className="admin-reorder-group-title">
            {items[0].subcategoryName ?? subSlug}{' '}
            <span className="mono admin-reorder-group-slug">{subSlug}</span>
          </h2>
          <ReorderList
            items={items}
            getKey={(it) => it.slug}
            disabled={reorder.isPending}
            onPersist={(slugs) => reorder.mutate(slugs)}
            renderRow={(it) => (
              <div className="admin-reorder-cells">
                <span className="admin-reorder-thumb">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt={it.slug} />
                  )}
                </span>
                <span className="mono admin-reorder-slug">{it.slug}</span>
                <span className="admin-reorder-name">{pickTr(it.translations, 'AZ')?.name}</span>
                <span className="admin-reorder-meta">
                  {it.price}
                  {it.priceUnit && <span style={{ color: 'var(--fg-3)' }}> /{it.priceUnit}</span>}
                </span>
                <span className="admin-reorder-actions">
                  <Link
                    href={`/admin/fleet/items/${it.slug}`}
                    className="admin-btn admin-btn-ghost"
                  >
                    Redaktə
                  </Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      if (confirm(`"${it.slug}" silinsin?`)) remove.mutate(it.slug);
                    }}
                    disabled={remove.isPending}
                  >
                    Sil
                  </button>
                </span>
              </div>
            )}
          />
        </section>
      ))}
    </div>
  );
}
