'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminAuth, adminFetch } from '@/lib/admin-auth';
import { pickTr, type FleetCategoryDto } from '@/lib/types';
import { ReorderList } from '@/components/admin/ReorderList';
import { useToast } from '@/components/admin/ToastProvider';

export default function FleetCategoriesList() {
  const { token, logout } = useAdminAuth();
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'fleet', 'categories'],
    queryFn: () =>
      adminFetch<FleetCategoryDto[]>('/api/v1/admin/fleet/categories', token, {}, logout),
    enabled: !!token,
  });

  const remove = useMutation({
    mutationFn: (slug: string) =>
      adminFetch<void>(`/api/v1/admin/fleet/categories/${slug}`, token, { method: 'DELETE' }, logout),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] }),
  });

  const reorder = useMutation({
    mutationFn: (slugs: string[]) =>
      adminFetch<void>('/api/v1/admin/fleet/categories/reorder', token, {
        method: 'PATCH',
        body: JSON.stringify({ slugs }),
      }, logout),
    onSuccess: () => {
      toast.success('Sıra yeniləndi');
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
    },
    onError: () => {
      toast.error('Sıra yadda saxlanmadı');
      qc.invalidateQueries({ queryKey: ['admin', 'fleet', 'categories'] });
    },
  });

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <h1>Texnika kateqoriyaları</h1>
          <p className="admin-page-sub">
            3-tier kataloqun birinci pilləsi. Sıralamaq üçün ⠿ tutub sürüşdürün — saytda
            birinci bu sırada açılır.
          </p>
        </div>
        <Link href="/admin/fleet/categories/new" className="admin-btn admin-btn-primary">
          + Əlavə et
        </Link>
      </header>

      {isLoading && <div className="admin-loading">Yüklənir…</div>}
      {isError && <div className="admin-form-error">Məlumat yüklənmədi.</div>}

      {data && data.length === 0 && (
        <div className="admin-table-empty">Hələ kateqoriya yoxdur.</div>
      )}

      {data && data.length > 0 && (
        <ReorderList
          items={data}
          getKey={(c) => c.slug}
          disabled={reorder.isPending}
          onPersist={(slugs) => reorder.mutate(slugs)}
          renderRow={(c) => (
            <div className="admin-reorder-cells">
              <span className="mono admin-reorder-slug">{c.slug}</span>
              <span className="admin-reorder-name">{pickTr(c.translations, 'AZ')?.name}</span>
              <span className="admin-reorder-meta">{c.subcategories.length} alt-kat.</span>
              <span className="admin-reorder-actions">
                <Link
                  href={`/admin/fleet/categories/${c.slug}`}
                  className="admin-btn admin-btn-ghost"
                >
                  Redaktə
                </Link>
                <button
                  className="admin-btn admin-btn-danger"
                  onClick={() => {
                    if (confirm(`"${c.slug}" silinsin? Alt-kateqoriyalar və texnikalar da silinəcək.`)) {
                      remove.mutate(c.slug);
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
      )}
    </div>
  );
}
