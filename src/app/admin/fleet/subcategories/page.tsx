'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FleetSubcategoryDto } from '@/lib/types';
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

export default function FleetSubcategoriesList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'subcategories'],
    queryFn: () =>
      adminFetch<FleetSubcategoryDto[]>('/api/v1/admin/fleet/subcategories', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/subcategories/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] }),
  });

  const reorder = useMutation({
    mutationFn: (slugs: string[]) =>
      adminFetch<void>('/api/v1/admin/fleet/subcategories/reorder', token, {
        method: 'PATCH',
        body: JSON.stringify({ slugs }),
      }, logout),
    onSuccess: () => {
      toast.success('Sıra yeniləndi');
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
    },
    onError: () => {
      toast.error('Sıra yadda saxlanmadı');
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'subcategories'] });
    },
  });

  const groups = data ? groupByOrdered(data, (s) => s.category.slug) : [];

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Alt-kateqoriyalar</h1>
          <p className="admin-page-sub">
            İkinci pillə. Hər kateqoriyanın içində ⠿ tutub sürüşdürərək sıralayın.
          </p>
        </div>
        <Link href="/admin/fleet/subcategories/new" className="admin-btn admin-btn-primary">
          + Əlavə et
        </Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}
      {data && data.length === 0 && (
        <div className="admin-table-empty">Hələ alt-kateqoriya yoxdur.</div>
      )}

      {groups.map(([catSlug, subs]) => (
        <section key={catSlug} className="admin-reorder-section">
          <h2 className="admin-reorder-group-title">
            {pickTr(subs[0].category.translations, 'AZ')?.name}{' '}
            <span className="mono admin-reorder-group-slug">{catSlug}</span>
          </h2>
          <ReorderList
            items={subs}
            getKey={(s) => s.slug}
            disabled={reorder.isPending}
            onPersist={(slugs) => reorder.mutate(slugs)}
            renderRow={(s) => (
              <div className="admin-reorder-cells">
                <span className="mono admin-reorder-slug">{s.slug}</span>
                <span className="admin-reorder-name">{pickTr(s.translations, 'AZ')?.name}</span>
                <span className="admin-reorder-actions">
                  <Link
                    href={`/admin/fleet/subcategories/${s.slug}`}
                    className="admin-btn admin-btn-ghost"
                  >
                    Redaktə
                  </Link>
                  <button
                    className="admin-btn admin-btn-danger"
                    onClick={() => {
                      if (confirm(`"${s.slug}" silinsin? Texnikalar da silinəcək.`)) {
                        remove.mutate(s.slug);
                      }
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
